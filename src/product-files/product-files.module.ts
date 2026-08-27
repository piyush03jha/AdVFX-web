import { Module } from "@nestjs/common";

import { ProductFilesController } from "./product-files.controller";
import { ProductFilesService } from "./product-files.service";
import { FileContentValidationService } from "./file-content-validation.service";

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
  providers: [
    ProductFilesService,
    FileContentValidationService,
  ],
  exports: [
    ProductFilesService,
    FileContentValidationService,
  ],
})
export class ProductFilesModule {}
