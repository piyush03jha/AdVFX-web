import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UploadsService } from './uploads.service';

@Controller('products/:productId/files')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('inspect')
  @UseInterceptors(FileInterceptor('file'))
  async inspect(
    @Param('productId') productId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('A file is required.');
    }

    const result = await this.uploadsService.inspect(file);

    return {
      productId,
      ...result,
    };
  }
}
