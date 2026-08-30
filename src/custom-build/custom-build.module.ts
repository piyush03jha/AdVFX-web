import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomBuildController } from './custom-build.controller';
import { CustomBuildService } from './custom-build.service';

@Module({
  imports: [PrismaModule],
  controllers: [CustomBuildController],
  providers: [CustomBuildService],
  exports: [CustomBuildService],
})
export class CustomBuildModule {}
