import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ProcessingJobStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProcessingJobsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a new processing job for a ProductFile.
   */
  async create(productFileId: string) {
    if (!productFileId) {
      throw new BadRequestException(
        "productFileId is required",
      );
    }

    const productFile =
      await this.prisma.productFile.findUnique({
        where: {
          id: productFileId,
        },
        select: {
          id: true,
        },
      });

    if (!productFile) {
      throw new NotFoundException(
        `Product file "${productFileId}" not found`,
      );
    }

    /**
     * Prevent duplicate active jobs for the same file.
     *
     * We only consider QUEUED and PROCESSING jobs active.
     */
    const existingJob =
      await this.prisma.productFileProcessingJob.findFirst({
        where: {
          productFileId,
          status: {
            in: [
              ProcessingJobStatus.QUEUED,
              ProcessingJobStatus.PROCESSING,
            ],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (existingJob) {
      return this.serializeJob(existingJob);
    }

    const job =
      await this.prisma.productFileProcessingJob.create({
        data: {
          productFileId,
          status: ProcessingJobStatus.QUEUED,
          attempts: 0,
          maxAttempts: 3,
        },
      });

    return this.serializeJob(job);
  }

  /**
   * Get all processing jobs.
   */
  async findAll() {
    const jobs =
      await this.prisma.productFileProcessingJob.findMany({
        orderBy: {
          createdAt: "desc",
        },

        include: {
          productFile: {
            select: {
              id: true,
              productId: true,
              originalName: true,
              storageKey: true,
              storageUrl: true,
              format: true,
              fileType: true,
              mimeType: true,
              fileSize: true,
              processingStatus: true,
              processingError: true,
              convertedFromId: true,
              createdAt: true,
              updatedAt: true,
            },
          },

          outputFile: {
            select: {
              id: true,
              productId: true,
              originalName: true,
              storageKey: true,
              storageUrl: true,
              format: true,
              fileType: true,
              mimeType: true,
              fileSize: true,
              processingStatus: true,
              processingError: true,
              convertedFromId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

    return jobs.map((job) =>
      this.serializeJob(job),
    );
  }

  /**
   * Get one processing job.
   */
  async findOne(id: string) {
    const job =
      await this.prisma.productFileProcessingJob.findUnique({
        where: {
          id,
        },

        include: {
          productFile: {
            select: {
              id: true,
              productId: true,
              originalName: true,
              storageKey: true,
              storageUrl: true,
              format: true,
              fileType: true,
              mimeType: true,
              fileSize: true,
              processingStatus: true,
              processingError: true,
              convertedFromId: true,
              createdAt: true,
              updatedAt: true,
            },
          },

          outputFile: {
            select: {
              id: true,
              productId: true,
              originalName: true,
              storageKey: true,
              storageUrl: true,
              format: true,
              fileType: true,
              mimeType: true,
              fileSize: true,
              processingStatus: true,
              processingError: true,
              convertedFromId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

    if (!job) {
      throw new NotFoundException(
        `Processing job "${id}" not found`,
      );
    }

    return this.serializeJob(job);
  }

  /**
   * Convert Prisma BigInt values into JSON-safe values.
   *
   * PostgreSQL fileSize is represented by Prisma as bigint.
   * Fastify/JSON.stringify cannot serialize bigint directly.
   */
  private serializeJob(job: any) {
    return {
      id: job.id,

      productFileId: job.productFileId,

      status: job.status,

      attempts: job.attempts,

      maxAttempts: job.maxAttempts,

      errorMessage: job.errorMessage,

      outputFileId: job.outputFileId,

      startedAt: job.startedAt,

      completedAt: job.completedAt,

      createdAt: job.createdAt,

      updatedAt: job.updatedAt,

      productFile: job.productFile
        ? this.serializeProductFile(job.productFile)
        : null,

      outputFile: job.outputFile
        ? this.serializeProductFile(job.outputFile)
        : null,
    };
  }

  /**
   * Serialize ProductFile metadata safely.
   */
  private serializeProductFile(file: any) {
    return {
      id: file.id,

      productId: file.productId,

      originalName: file.originalName,

      storageKey: file.storageKey,

      storageUrl: file.storageUrl,

      format: file.format,

      fileType: file.fileType,

      mimeType: file.mimeType,

      /**
       * BigInt -> string
       *
       * String is safer than Number for file sizes because
       * BigInt can represent values larger than JS safe integers.
       */
      fileSize: file.fileSize?.toString() ?? null,

      processingStatus: file.processingStatus,

      processingError: file.processingError,

      convertedFromId: file.convertedFromId,

      createdAt: file.createdAt,

      updatedAt: file.updatedAt,
    };
  }
}