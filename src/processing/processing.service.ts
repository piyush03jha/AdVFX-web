import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ProcessingJobStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createJob(productFileId: string) {
    if (!productFileId) {
      throw new Error("productFileId is required");
    }

    const productFile = await this.prisma.productFile.findUnique({
      where: { id: productFileId },
      select: { id: true },
    });

    if (!productFile) {
      throw new NotFoundException(`Product file \"${productFileId}\" not found`);
    }

    const activeJob = await this.prisma.productFileProcessingJob.findFirst({
      where: {
        productFileId,
        status: {
          in: [ProcessingJobStatus.QUEUED, ProcessingJobStatus.PROCESSING],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (activeJob) {
      return this.serialize(activeJob);
    }

    const job = await this.prisma.productFileProcessingJob.create({
      data: {
        productFileId,
        status: ProcessingJobStatus.QUEUED,
        attempts: 0,
        maxAttempts: 3,
      },
    });

    this.logger.log(`Created processing job ${job.id} for ${productFileId}`);
    return this.serialize(job);
  }

  async listJobs() {
    const jobs = await this.prisma.productFileProcessingJob.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        productFile: true,
        outputFile: true,
      },
    });

    return jobs.map((job) => this.serialize(job));
  }

  async getJob(id: string) {
    const job = await this.prisma.productFileProcessingJob.findUnique({
      where: { id },
      include: {
        productFile: true,
        outputFile: true,
      },
    });

    if (!job) {
      throw new NotFoundException(`Processing job \"${id}\" not found`);
    }

    return this.serialize(job);
  }

  private serialize(job: any) {
    return JSON.parse(
      JSON.stringify(job, (_, value) =>
        typeof value === "bigint" ? value.toString() : value,
      ),
    );
  }
}
