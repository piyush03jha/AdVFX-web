import { Injectable } from '@nestjs/common';

import {
  ProcessingStatus,
  SupportedModelFormat,
} from './processing.types';

export interface ProcessingJob {
  assetId: string;
  format: SupportedModelFormat;
  inputKey: string;
}

@Injectable()
export class ProcessingService {
  queue(job: ProcessingJob): ProcessingStatus {
    // Queue integration will be added with BullMQ/Redis.
    // Keeping this method synchronous for now avoids pretending a job was queued.
    void job;
    return 'PENDING';
  }
}
