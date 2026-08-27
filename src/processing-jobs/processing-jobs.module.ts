import { Module } from "@nestjs/common";

import { ProcessingJobsController } from "./processing-jobs.controller";
import { ProcessingJobsService } from "./processing-jobs.service";
import { ProcessingJobsWorker } from "./processing-jobs.worker";
import { ProcessingJobs2DWorker } from "./processing-jobs-2d.worker";
import { ImageProcessingService } from "./image-processing.service";

import { PrismaModule } from "../prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";
import { ProductFilesModule } from "../product-files/product-files.module";

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    ProductFilesModule,
  ],

  controllers: [
    ProcessingJobsController,
  ],

  providers: [
    ProcessingJobsService,
    ProcessingJobsWorker,
    ProcessingJobs2DWorker,
    ImageProcessingService,
  ],

  exports: [
    ProcessingJobsService,
    ProcessingJobsWorker,
    ProcessingJobs2DWorker,
    ImageProcessingService,
  ],
})
export class ProcessingJobsModule {}
