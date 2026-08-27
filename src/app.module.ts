import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";
import { ProductFilesModule } from "./product-files/product-files.module";
import { ProcessingJobsModule } from "./processing-jobs/processing-jobs.module";

@Module({
  imports: [
    PrismaModule,
    ProductsModule,
    ProductFilesModule,
    ProcessingJobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}