import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProductsModule } from "./products/products.module";
import { ProductFilesModule } from "./product-files/product-files.module";
import { ProcessingJobsModule } from "./processing-jobs/processing-jobs.module";
import { CategoriesModule } from "./categories/categories.module";
import { CartModule } from "./cart/cart.module";
import { OrdersModule } from "./orders/orders.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminModule,
    CategoriesModule,
    ProductsModule,
    ProductFilesModule,
    ProcessingJobsModule,
    CartModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
