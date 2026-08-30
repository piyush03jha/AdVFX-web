import {
  BadRequestException,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../auth/guards/auth.guard';
import { StorageService } from '../storage/storage.service';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(AuthGuard)
@Controller('custom-requests/:requestId/files')
export class CustomBuildFilesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  async upload(@Req() req: FastifyRequest, @Param('requestId') requestId: string) {
    const user = (req as FastifyRequest & { user?: { id: string } }).user;
    if (!user) throw new BadRequestException('Authentication is required');

    const request = await this.prisma.customRequest.findFirst({
      where: { id: requestId, userId: user.id },
      select: { id: true },
    });
    if (!request) throw new BadRequestException('Custom request not found');

    const multipart = (req as FastifyRequest & { file?: () => Promise<any> }).file;
    if (typeof multipart !== 'function') {
      throw new BadRequestException('Multipart upload support is not available');
    }

    const uploaded = await multipart();
    if (!uploaded) throw new BadRequestException('File is required');

    const buffer = await uploaded.toBuffer();
    if (buffer.length === 0) throw new BadRequestException('Uploaded file is empty');
    if (buffer.length > 50 * 1024 * 1024) {
      throw new BadRequestException('Reference file exceeds the 50 MB limit');
    }

    const allowedMimeTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]);
    if (!allowedMimeTypes.has(uploaded.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, WEBP and PDF references are supported');
    }

    const stored = await this.storage.saveCustomRequestFile(
      requestId,
      uploaded.filename,
      buffer,
    );

    try {
      return await this.prisma.customRequestMedia.create({
        data: {
          customRequestId: requestId,
          originalName: uploaded.filename,
          storageKey: stored.storageKey,
          storageUrl: stored.storageUrl,
          mimeType: uploaded.mimetype,
          fileSize: BigInt(buffer.length),
        },
      });
    } catch (error) {
      await this.storage.delete(stored.storageKey);
      throw error;
    }
  }
}
