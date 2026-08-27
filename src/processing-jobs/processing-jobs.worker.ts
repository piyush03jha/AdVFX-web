import {
  Injectable,
  Logger,
} from "@nestjs/common";

import {
  ProcessingJobStatus,
  ProcessingStatus,
  ProductFileFormat,
  ProductFileType,
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

  async processNextJob() {
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

    if (!job) {
      this.logger.log("No queued processing jobs found.");
      return null;
    }

    const attempt = job.attempts + 1;

    this.logger.log(
      `Starting processing job ${job.id} (attempt ${attempt}/${job.maxAttempts})`,
    );

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

    await this.prisma.productFile.update({
      where: {
        id: job.productFileId,
      },
      data: {
        processingStatus: ProcessingStatus.PROCESSING,
        processingError: null,
      },
    });

    try {
      await this.processFile(job.productFile);

      await this.prisma.productFile.update({
        where: {
          id: job.productFileId,
        },
        data: {
          processingStatus: ProcessingStatus.COMPLETED,
          processingError: null,
        },
      });

      const completedJob =
        await this.prisma.productFileProcessingJob.update({
          where: {
            id: job.id,
          },
          data: {
            status: ProcessingJobStatus.COMPLETED,
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

      return this.serializeJob(completedJob);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown processing error";

      this.logger.error(
        `Processing job ${job.id} failed: ${errorMessage}`,
      );

      const shouldRetry = attempt < job.maxAttempts;

      if (shouldRetry) {
        await this.prisma.productFile.update({
          where: {
            id: job.productFileId,
          },
          data: {
            processingStatus: ProcessingStatus.PENDING,
            processingError: errorMessage,
          },
        });

        const retryJob =
          await this.prisma.productFileProcessingJob.update({
            where: {
              id: job.id,
            },
            data: {
              status: ProcessingJobStatus.QUEUED,
              errorMessage,
              completedAt: null,
            },
            include: {
              productFile: true,
              outputFile: true,
            },
          });

        this.logger.warn(
          `Job ${job.id} returned to QUEUED for retry (${attempt}/${job.maxAttempts})`,
        );

        return this.serializeJob(retryJob);
      }

      await this.prisma.productFile.update({
        where: {
          id: job.productFileId,
        },
        data: {
          processingStatus: ProcessingStatus.FAILED,
          processingError: errorMessage,
        },
      });

      const failedJob =
        await this.prisma.productFileProcessingJob.update({
          where: {
            id: job.id,
          },
          data: {
            status: ProcessingJobStatus.FAILED,
            errorMessage,
            completedAt: new Date(),
          },
          include: {
            productFile: true,
            outputFile: true,
          },
        });

      this.logger.error(
        `Processing job ${job.id} permanently failed after ${job.maxAttempts} attempts`,
      );

      return this.serializeJob(failedJob);
    }
  }

  private async processFile(
    productFile: {
      id: string;
      fileType: ProductFileType;
      format: ProductFileFormat;
      storageKey: string;
      fileSize: bigint;
    },
  ): Promise<void> {
    const absolutePath = this.resolveStoragePath(productFile.storageKey);

    this.logger.log(`Processing file ${productFile.id}`);
    this.logger.log(`Format: ${productFile.format}`);

    try {
      await fs.access(absolutePath);
    } catch {
      throw new Error(
        `Storage file not found: ${productFile.storageKey}`,
      );
    }

    switch (productFile.format) {
      case ProductFileFormat.GLB:
        await this.validateGlb(productFile);
        return;

      case ProductFileFormat.GLTF:
        await this.validateGltf(productFile);
        return;

      case ProductFileFormat.PNG:
      case ProductFileFormat.JPG:
      case ProductFileFormat.JPEG:
      case ProductFileFormat.WEBP: {
        const metadata =
          await this.imageProcessingService.validateRasterImage(
            absolutePath,
          );

        await this.prisma.productFile.update({
          where: {
            id: productFile.id,
          },
          data: {
            imageWidth: metadata.width,
            imageHeight: metadata.height,
            imageChannels: metadata.channels,
            imageHasAlpha: metadata.hasAlpha,
            imageColorSpace: metadata.space ?? null,
          },
        });

        this.logger.log(
          `Image validated: ${metadata.width}x${metadata.height} ${metadata.format}`,
        );

        return;
      }

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

      case ProductFileFormat.PDF:
        await this.processingJobs2DWorker.processFile(productFile);
        return;

      default:
        throw new Error(
          `Format ${productFile.format} does not have a processing adapter yet`,
        );
    }
  }

  private async validateGlb(
    productFile: {
      id: string;
      storageKey: string;
    },
  ): Promise<void> {
    const filePath = this.resolveStoragePath(productFile.storageKey);
    const buffer = await fs.readFile(filePath);

    if (buffer.length < 12) {
      throw new Error("Invalid GLB: file is too small");
    }

    const magic = buffer.toString("ascii", 0, 4);
    if (magic !== "glTF") {
      throw new Error(`Invalid GLB: invalid magic "${magic}"`);
    }

    const version = buffer.readUInt32LE(4);
    if (version !== 2) {
      throw new Error(`Invalid GLB: unsupported version ${version}`);
    }

    const declaredLength = buffer.readUInt32LE(8);
    if (declaredLength !== buffer.length) {
      throw new Error(
        `Invalid GLB: declared length ${declaredLength} does not match actual length ${buffer.length}`,
      );
    }

    this.logger.log(`GLB validation successful for ${productFile.id}`);
  }

  private async validateGltf(
    productFile: {
      id: string;
      storageKey: string;
    },
  ): Promise<void> {
    const filePath = this.resolveStoragePath(productFile.storageKey);
    const buffer = await fs.readFile(filePath);

    let document: unknown;

    try {
      document = JSON.parse(buffer.toString("utf8"));
    } catch {
      throw new Error("Invalid glTF: file is not valid JSON");
    }

    if (
      typeof document !== "object" ||
      document === null ||
      Array.isArray(document)
    ) {
      throw new Error("Invalid glTF: root must be a JSON object");
    }

    const asset = (document as { asset?: unknown }).asset;

    if (
      typeof asset !== "object" ||
      asset === null ||
      Array.isArray(asset) ||
      typeof (asset as { version?: unknown }).version !== "string"
    ) {
      throw new Error("Invalid glTF: asset.version is required");
    }

    const version = (asset as { version: string }).version;
    if (!version.startsWith("2.")) {
      throw new Error(
        `Invalid glTF: unsupported asset version ${version}`,
      );
    }

    this.logger.log(`glTF validation successful for ${productFile.id}`);
  }

  private resolveStoragePath(storageKey: string): string {
    const storageRoot =
      process.env.STORAGE_ROOT ??
      path.join(process.cwd(), "storage");

    const normalizedRoot = path.resolve(storageRoot);
    const resolvedPath = path.resolve(normalizedRoot, storageKey);

    if (
      resolvedPath !== normalizedRoot &&
      !resolvedPath.startsWith(`${normalizedRoot}${path.sep}`)
    ) {
      throw new Error("Invalid storage key");
    }

    return resolvedPath;
  }

  private serializeJob<T>(job: T): T {
    return JSON.parse(
      JSON.stringify(job, (_, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );
  }
}
