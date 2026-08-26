import { Module } from '@nestjs/common';

import { ProcessingModule } from '../processing/processing.module';
import { StorageModule } from '../storage/storage.module';

import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [StorageModule, ProcessingModule],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
