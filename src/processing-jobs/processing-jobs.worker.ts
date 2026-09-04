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
  private readonly logger = new Logger(ProcessingJobsWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly contentValidator: FileContentValidationService,
    private readonly processingJobs2DWorker: ProcessingJobs2DWorker,
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

  async processNextJob() {
    const job = await this.prisma.productFileProcessingJob.findFirst({
<<<<<<< HEAD
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
=======
      where: { status: ProcessingJobStatus.QUEUED },
      orderBy: { createdAt: "asc" },
      include: { productFile: true, outputFile: true },
>>>>>>> origin/feat/backend-catalog-admin-foundation
    });

    if (!job) {
      this.logger.log("No queued processing jobs found.");
      return null;
    }

    const attempt = job.attempts + 1;

<<<<<<< HEAD
    this.logger.log(
      `Starting processing job ${job.id} (attempt ${attempt}/${job.maxAttempts})`,
    );

    await this.prisma.productFileProcessingJob.update({
      where: {
        id: job.id,
      },
=======
    await this.prisma.productFileProcessingJob.update({
      where: { id: job.id },
>>>>>>> origin/feat/backend-catalog-admin-foundation
      data: {
        status: ProcessingJobStatus.PROCESSING,
        attempts: attempt,
        startedAt: new Date(),
        completedAt: null,
        errorMessage: null,
      },
    });

    await this.prisma.productFile.update({
<<<<<<< HEAD
      where: {
        id: job.productFileId,
      },
=======
      where: { id: job.productFileId },
>>>>>>> origin/feat/backend-catalog-admin-foundation
      data: {
        processingStatus: ProcessingStatus.PROCESSING,
        processingError: null,
      },
    });

    try {
      await this.processFile(job.productFile);

<<<<<<< HEAD
      await this.prisma.productFile.update({
        where: {
          id: job.productFileId,
        },
=======
      const completedFile = await this.prisma.productFile.update({
        where: { id: job.productFileId },
>>>>>>> origin/feat/backend-catalog-admin-foundation
        data: {
          processingStatus: ProcessingStatus.COMPLETED,
          processingError: null,
        },
      });

<<<<<<< HEAD
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

=======
      await this.publishCustomPreviewIfReady(completedFile.id);

      const completedJob = await this.prisma.productFileProcessingJob.update({
        where: { id: job.id },
        data: {
          status: ProcessingJobStatus.COMPLETED,
          completedAt: new Date(),
          errorMessage: null,
        },
        include: { productFile: true, outputFile: true },
      });

      this.logger.log(`Processing job ${job.id} completed successfully`);
>>>>>>> origin/feat/backend-catalog-admin-foundation
      return this.serializeJob(completedJob);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown processing error";

      this.logger.error(`Processing job ${job.id} failed: ${errorMessage}`);

      const shouldRetry = attempt < job.maxAttempts;

      if (shouldRetry) {
        await this.prisma.productFile.update({
<<<<<<< HEAD
          where: {
            id: job.productFileId,
          },
=======
          where: { id: job.productFileId },
>>>>>>> origin/feat/backend-catalog-admin-foundation
          data: {
            processingStatus: ProcessingStatus.PENDING,
            processingError: errorMessage,
          },
        });

<<<<<<< HEAD
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
=======
        const retryJob = await this.prisma.productFileProcessingJob.update({
          where: { id: job.id },
          data: {
            status: ProcessingJobStatus.QUEUED,
            errorMessage,
            completedAt: null,
          },
          include: { productFile: true, outputFile: true },
        });
>>>>>>> origin/feat/backend-catalog-admin-foundation

        return this.serializeJob(retryJob);
      }

      await this.prisma.productFile.update({
<<<<<<< HEAD
        where: {
          id: job.productFileId,
        },
=======
        where: { id: job.productFileId },
>>>>>>> origin/feat/backend-catalog-admin-foundation
        data: {
          processingStatus: ProcessingStatus.FAILED,
          processingError: errorMessage,
        },
      });

<<<<<<< HEAD
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
=======
      const failedJob = await this.prisma.productFileProcessingJob.update({
        where: { id: job.id },
        data: {
          status: ProcessingJobStatus.FAILED,
          errorMessage,
          completedAt: new Date(),
        },
        include: { productFile: true, outputFile: true },
      });
>>>>>>> origin/feat/backend-catalog-admin-foundation

      return this.serializeJob(failedJob);
    }
  }

<<<<<<< HEAD
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

=======
  private async publishCustomPreviewIfReady(productFileId: string) {
    const file = await this.prisma.productFile.findUnique({
      where: { id: productFileId },
      include: { customPreview: true },
    });

    if (!file?.customPreview) return;
    if (![ProductFileFormat.GLB, ProductFileFormat.GLTF].includes(file.format)) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.customRequestPreview.update({
        where: { id: file.customPreview!.id },
        data: {
          status: "READY",
          url: file.storageUrl ?? file.customPreview!.url,
        },
      });

      await tx.customRequest.update({
        where: { id: file.customPreview!.customRequestId },
        data: { status: "CUSTOMER_REVIEW" },
      });
    });

    this.logger.log(
      `Published custom preview ${file.customPreview.id} for request ${file.customPreview.customRequestId}`,
    );
  }

  private async processFile(
    productFile: {
      id: string;
      format: ProductFileFormat;
      storageKey: string;
      fileSize: bigint;
    },
  ): Promise<void> {
    const absolutePath = this.resolveStoragePath(productFile.storageKey);

    try {
      await fs.access(absolutePath);
    } catch {
      throw new Error(`Storage file not found: ${productFile.storageKey}`);
    }

    switch (productFile.format) {
      case ProductFileFormat.GLB:
        await this.validateGlb(productFile);
        return;
      case ProductFileFormat.PNG:
      case ProductFileFormat.JPG:
      case ProductFileFormat.WEBP: {
        const metadata = await this.imageProcessingService.validateRasterImage(
          absolutePath,
        );

        await this.prisma.productFile.update({
          where: { id: productFile.id },
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
        await this.imageProcessingService.validateSvg(absolutePath);
        return;
      case ProductFileFormat.PDF:
        await this.processingJobs2DWorker.processFile(productFile as any);
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
      fileSize: bigint;
    },
  ) {
    const filePath = this.resolveStoragePath(productFile.storageKey);
    const buffer = await fs.readFile(filePath);

    if (buffer.length < 12) {
      throw new Error(`Invalid GLB: file is too small (${buffer.length} bytes)`);
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

  private resolveStoragePath(storageKey: string) {
    const storageRoot =
      process.env.STORAGE_ROOT ?? path.join(process.cwd(), "storage");
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

>>>>>>> origin/feat/backend-catalog-admin-foundation
  private serializeJob<T>(job: T): T {
    return JSON.parse(
      JSON.stringify(job, (_, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );
  }
}
