import { Module } from "@nestjs/common";

import { ProductFilesController } from "./product-files.controller";
import { ProductFilesService } from "./product-files.service";

import { PrismaModule } from "../prisma/prisma.module";
import { ProcessingJobsModule } from "../processing-jobs/processing-jobs.module";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    ProcessingJobsModule,
  ],
  controllers: [ProductFilesController],
  providers: [ProductFilesService],
  exports: [ProductFilesService],
})
export class ProductFilesModule {}
