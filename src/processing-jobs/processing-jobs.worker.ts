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

import { promises as fs } from "node:fs";

import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";
import { FileContentValidationService } from "../product-files/file-content-validation.service";
import { ProcessingJobs2DWorker } from "./processing-jobs-2d.worker";
import { ImageProcessingService } from "./image-processing.service";

@Injectable()
export class ProcessingJobsWorker {
  private readonly logger = new Logger(
    ProcessingJobsWorker.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly contentValidator: FileContentValidationService,
    private readonly processingJobs2DWorker: ProcessingJobs2DWorker,
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

  async processNextJob() {
    const job = await this.prisma.productFileProcessingJob.findFirst({
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

      const shouldRetry =
        attempt < job.maxAttempts;

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

  private async processFile(productFile: {
    id: string;
    fileType: ProductFileType;
    format: ProductFileFormat;
    storageKey: string;
    fileSize: bigint;
  }): Promise<void> {
    if (!(await this.storage.exists(productFile.storageKey))) {
      throw new Error(
        `Storage file not found: ${productFile.storageKey}`,
      );
    }

    const absolutePath = this.storage.getAbsolutePath(
      productFile.storageKey,
    );

    const buffer = await fs.readFile(absolutePath);

    await this.contentValidator.validate(
      productFile.format,
      buffer,
    );

    if (
      productFile.fileType ===
      ProductFileType.IMAGE
    ) {
      switch (productFile.format) {
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

          return;
        }

        case ProductFileFormat.SVG:
          await this.imageProcessingService.validateSvg(
            absolutePath,
          );
          return;

        default:
          throw new Error(
            `Unsupported image format: ${productFile.format}`,
          );
      }
    }

    if (
      productFile.fileType ===
      ProductFileType.DOCUMENT
    ) {
      await this.processingJobs2DWorker.processFile(
        productFile,
      );
      return;
    }

    if (
      productFile.fileType ===
        ProductFileType.MODEL &&
      productFile.format === ProductFileFormat.GLB
    ) {
      return;
    }

    if (
      productFile.fileType ===
      ProductFileType.MODEL
    ) {
      throw new Error(
        `Format ${productFile.format} does not have a processing adapter yet`,
      );
    }

    throw new Error(
      `Unsupported product file type: ${productFile.fileType}`,
    );
  }

  private serializeJob<T>(job: T): T {
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
