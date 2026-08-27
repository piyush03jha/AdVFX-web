import {
  Injectable,
  Logger,
} from "@nestjs/common";

import {
  ProcessingJobStatus,
  ProcessingStatus,
  ProductFileFormat,
} from "@prisma/client";

import { promises as fs } from "fs";
import path from "path";

import { ProcessingJobs2DWorker } from "./processing-jobs-2d.worker";
import { PrismaService } from "../prisma/prisma.service";
import { ImageProcessingService } from "./image-processing.service";

@Injectable()
export class ProcessingJobsWorker {
  private readonly logger = new Logger(
    ProcessingJobsWorker.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly processingJobs2DWorker: ProcessingJobs2DWorker,
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

  /**
   * ============================================================
   * PROCESS NEXT QUEUED JOB
   * ============================================================
   *
   * QUEUED
   *    ↓
   * PROCESSING
   *    ↓
   * process / validate
   *    ↓
   * COMPLETED
   *
   * On error:
   *
   * PROCESSING
   *    ↓
   * retry available
   *    ↓
   * QUEUED
   *
   * or
   *
   * PROCESSING
   *    ↓
   * max attempts reached
   *    ↓
   * FAILED
   */
  async processNextJob() {
    /**
     * Find oldest queued job.
     */
    const job =
      await this.prisma.productFileProcessingJob.findFirst({
        where: {
          status: ProcessingJobStatus.QUEUED,
        },

        orderBy: {
          createdAt: "asc",
        },

        include: {
          productFile: true,
          outputFile: true,
        },
      });

    /**
     * No queued jobs.
     */
    if (!job) {
      this.logger.log(
        "No queued processing jobs found.",
      );

      return null;
    }

    const attempt = job.attempts + 1;

    this.logger.log(
      `Starting processing job ${job.id} ` +
        `(attempt ${attempt}/${job.maxAttempts})`,
    );

    /**
     * ==========================================================
     * CLAIM JOB
     * ==========================================================
     */
    await this.prisma.productFileProcessingJob.update({
      where: {
        id: job.id,
      },

      data: {
        status: ProcessingJobStatus.PROCESSING,
        attempts: attempt,
        startedAt: new Date(),
        completedAt: null,
        errorMessage: null,
      },
    });

    /**
     * Mark source file as PROCESSING.
     */
    await this.prisma.productFile.update({
      where: {
        id: job.productFileId,
      },

      data: {
        processingStatus:
          ProcessingStatus.PROCESSING,

        processingError: null,
      },
    });

    try {
      /**
       * ========================================================
       * PROCESS FILE
       * ========================================================
       */
      await this.processFile(
        job.productFile,
      );

      /**
       * ========================================================
       * MARK PRODUCT FILE COMPLETED
       * ========================================================
       *
       * Do this BEFORE fetching the completed job.
       */
      await this.prisma.productFile.update({
        where: {
          id: job.productFileId,
        },

        data: {
          processingStatus:
            ProcessingStatus.COMPLETED,

          processingError: null,
        },
      });

      /**
       * ========================================================
       * MARK JOB COMPLETED
       * ========================================================
       */
      const completedJob =
        await this.prisma.productFileProcessingJob.update({
          where: {
            id: job.id,
          },

          data: {
            status:
              ProcessingJobStatus.COMPLETED,

            completedAt: new Date(),

            errorMessage: null,
          },

          include: {
            productFile: true,
            outputFile: true,
          },
        });

      this.logger.log(
        `Processing job ${job.id} completed successfully`,
      );

      return this.serializeJob(
        completedJob,
      );
    } catch (error) {
      /**
       * ========================================================
       * PROCESSING ERROR
       * ========================================================
       */
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown processing error";

      this.logger.error(
        `Processing job ${job.id} failed: ${errorMessage}`,
      );

      const shouldRetry =
        attempt < job.maxAttempts;

      /**
       * ========================================================
       * RETRY
       * ========================================================
       */
      if (shouldRetry) {
        /**
         * First return ProductFile to PENDING.
         */
        await this.prisma.productFile.update({
          where: {
            id: job.productFileId,
          },

          data: {
            processingStatus:
              ProcessingStatus.PENDING,

            processingError: errorMessage,
          },
        });

        /**
         * Then update job to QUEUED and fetch
         * the latest ProductFile.
         */
        const retryJob =
          await this.prisma.productFileProcessingJob.update({
            where: {
              id: job.id,
            },

            data: {
              status:
                ProcessingJobStatus.QUEUED,

              errorMessage,

              completedAt: null,
            },

            include: {
              productFile: true,
              outputFile: true,
            },
          });

        this.logger.warn(
          `Job ${job.id} returned to QUEUED for retry ` +
            `(${attempt}/${job.maxAttempts})`,
        );

        return this.serializeJob(
          retryJob,
        );
      }

      /**
       * ========================================================
       * PERMANENT FAILURE
       * ========================================================
       */
      await this.prisma.productFile.update({
        where: {
          id: job.productFileId,
        },

        data: {
          processingStatus:
            ProcessingStatus.FAILED,

          processingError: errorMessage,
        },
      });

      /**
       * Update job AFTER ProductFile.
       *
       * Therefore returned productFile contains
       * FAILED state.
       */
      const failedJob =
        await this.prisma.productFileProcessingJob.update({
          where: {
            id: job.id,
          },

          data: {
            status:
              ProcessingJobStatus.FAILED,

            errorMessage,

            completedAt: new Date(),
          },

          include: {
            productFile: true,
            outputFile: true,
          },
        });

      this.logger.error(
        `Job ${job.id} permanently failed after ` +
          `${job.maxAttempts} attempts`,
      );

      return this.serializeJob(
        failedJob,
      );
    }
  }

  /**
   * ============================================================
   * PROCESS FILE
   * ============================================================
   */
  private async processFile(
    productFile: {
      id: string;
      format: ProductFileFormat;
      storageKey: string;
      fileSize: bigint;
    },
  ): Promise<void> {
    const absolutePath =
      this.resolveStoragePath(
        productFile.storageKey,
      );

    this.logger.log(
      `Processing file ${productFile.id}`,
    );

    this.logger.log(
      `Format: ${productFile.format}`,
    );

    this.logger.log(
      `Path: ${absolutePath}`,
    );

    /**
     * ==========================================================
     * VERIFY PHYSICAL FILE
     * ==========================================================
     */
    try {
      await fs.access(
        absolutePath,
      );
    } catch {
      throw new Error(
        `Storage file not found: ${productFile.storageKey}`,
      );
    }

    /**
     * ==========================================================
     * FORMAT DISPATCH
     * ==========================================================
     */
    switch (productFile.format) {
      /**
       * ========================================================
       * GLB
       * ========================================================
       */
      case ProductFileFormat.GLB: {
        await this.validateGlb(
          productFile,
        );

        return;
      }

      /**
       * ========================================================
       * RASTER IMAGES
       * ========================================================
       */
      case ProductFileFormat.PNG:
      case ProductFileFormat.JPG:
      case ProductFileFormat.JPEG:
      case ProductFileFormat.WEBP: {
        const metadata =
          await this.imageProcessingService.validateRasterImage(
            absolutePath,
          );

        /**
         * Store image metadata.
         */
        await this.prisma.productFile.update({
          where: {
            id: productFile.id,
          },

          data: {
            imageWidth:
              metadata.width,

            imageHeight:
              metadata.height,

            imageChannels:
              metadata.channels,

            imageHasAlpha:
              metadata.hasAlpha,

            imageColorSpace:
              metadata.space ?? null,
          },
        });

        this.logger.log(
          `Image validated: ` +
            `${metadata.width}x${metadata.height} ` +
            `${metadata.format}`,
        );

        this.logger.log(
          `Channels: ${metadata.channels}, ` +
            `Alpha: ${metadata.hasAlpha}`,
        );

        this.logger.log(
          `Color space: ${
            metadata.space ?? "unknown"
          }`,
        );

        return;
      }

      /**
       * ========================================================
       * SVG
       * ========================================================
       */
      case ProductFileFormat.SVG: {
        const metadata =
          await this.imageProcessingService.validateSvg(
            absolutePath,
          );

        this.logger.log(
          `SVG validated: ${metadata.sizeBytes} bytes`,
        );

        return;
      }

      /**
       * ========================================================
       * 2D DOCUMENTS / OTHER SUPPORTED 2D FORMATS
       * ========================================================
       */
      case ProductFileFormat.PDF: {
        await this.processingJobs2DWorker.processFile(
          productFile as any,
        );

        return;
      }

      /**
       * ========================================================
       * UNSUPPORTED
       * ========================================================
       */
      default:
        throw new Error(
          `Format ${productFile.format} does not have a processing adapter yet`,
        );
    }
  }

  /**
   * ============================================================
   * VALIDATE GLB
   * ============================================================
   */
  private async validateGlb(
    productFile: {
      id: string;
      storageKey: string;
      fileSize: bigint;
    },
  ): Promise<void> {
    const filePath =
      this.resolveStoragePath(
        productFile.storageKey,
      );

    this.logger.log(
      `Validating GLB: ${filePath}`,
    );

    const buffer =
      await fs.readFile(filePath);

    /**
     * Minimum GLB header.
     */
    if (buffer.length < 12) {
      throw new Error(
        `Invalid GLB: file is too small (${buffer.length} bytes)`,
      );
    }

    /**
     * ==========================================================
     * MAGIC
     * ==========================================================
     */
    const magic =
      buffer.toString(
        "ascii",
        0,
        4,
      );

    if (magic !== "glTF") {
      throw new Error(
        `Invalid GLB: invalid magic "${magic}"`,
      );
    }

    /**
     * ==========================================================
     * VERSION
     * ==========================================================
     */
    const version =
      buffer.readUInt32LE(4);

    if (version !== 2) {
      throw new Error(
        `Invalid GLB: unsupported version ${version}`,
      );
    }

    /**
     * ==========================================================
     * DECLARED FILE LENGTH
     * ==========================================================
     */
    const declaredLength =
      buffer.readUInt32LE(8);

    if (
      declaredLength !==
      buffer.length
    ) {
      throw new Error(
        `Invalid GLB: declared length ${declaredLength} ` +
          `does not match actual length ${buffer.length}`,
      );
    }

    this.logger.log(
      `GLB validation successful for ${productFile.id}`,
    );
  }

  /**
   * ============================================================
   * RESOLVE STORAGE PATH
   * ============================================================
   */
  private resolveStoragePath(
    storageKey: string,
  ): string {
    const storageRoot =
      process.env.STORAGE_ROOT ??
      path.join(
        process.cwd(),
        "storage",
      );

    const normalizedRoot =
      path.resolve(storageRoot);

    const resolvedPath =
      path.resolve(
        normalizedRoot,
        storageKey,
      );

    /**
     * Prevent path traversal.
     */
    if (
      resolvedPath !== normalizedRoot &&
      !resolvedPath.startsWith(
        `${normalizedRoot}${path.sep}`,
      )
    ) {
      throw new Error(
        "Invalid storage key",
      );
    }

    return resolvedPath;
  }

  /**
   * ============================================================
   * SERIALIZE JOB
   * ============================================================
   */
  private serializeJob<T>(
    job: T,
  ): T {
    return JSON.parse(
      JSON.stringify(
        job,
        (_, value) =>
          typeof value === "bigint"
            ? value.toString()
            : value,
      ),
    );
  }
}