import { Injectable } from '@nestjs/common';

import { StoredFile } from './storage.types';

@Injectable()
export class StorageService {
  async save(file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  }): Promise<StoredFile> {
    throw new Error(
      'StorageService.save is not configured yet. Configure object storage before enabling uploads.',
    );
  }
}
