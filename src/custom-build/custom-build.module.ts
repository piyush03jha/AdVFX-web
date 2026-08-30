import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { CustomBuildController } from './custom-build.controller';
import { CustomBuildFilesController } from './custom-build.files.controller';
import { CustomBuildService } from './custom-build.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [CustomBuildController, CustomBuildFilesController],
  providers: [CustomBuildService],
  exports: [CustomBuildService],
})
export class CustomBuildModule {}
