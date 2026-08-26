import { Injectable } from '@nestjs/common';

import { ProcessingService } from '../processing/processing.service';
import { StorageService } from '../storage/storage.service';

import {
  assertSupportedExtension,
  SupportedExtension,
} from './uploads.validation';

export interface UploadResult {
  originalName: string;
  extension: SupportedExtension;
  status: 'PENDING';
}

@Injectable()
export class UploadsService {
  constructor(
    private readonly storageService: StorageService,
    private readonly processingService: ProcessingService,
  ) {}

  async inspect(file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  }): Promise<UploadResult> {
    const extension = assertSupportedExtension(file.originalname);

    // Storage and processing are deliberately not executed here until the
    // ProductFile Prisma model and object-storage implementation are added.
    void this.storageService;
    void this.processingService;

    return {
      originalName: file.originalname,
      extension,
      status: 'PENDING',
    };
  }
}
