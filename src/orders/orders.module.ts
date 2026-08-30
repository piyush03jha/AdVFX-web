import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PricingModule } from '../pricing/pricing.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ReturnsService } from './returns.service';

@Module({
  imports: [PrismaModule, NotificationsModule, PricingModule],
  controllers: [OrdersController],
  providers: [OrdersService, ReturnsService],
  exports: [OrdersService, ReturnsService],
})
export class OrdersModule {}
