import {
  BadRequestException,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { CustomRequestStatus, ProductFileFormat, ProductFileType, ProcessingStatus } from '@prisma/client';
import { extname } from 'node:path';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ProcessingJobsService } from '../processing-jobs/processing-jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const REFERENCE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const CUSTOM_PREVIEW_EXTENSIONS: Record<string, ProductFileFormat> = {
  '.glb': ProductFileFormat.GLB,
  '.gltf': ProductFileFormat.GLTF,
};

@UseGuards(AuthGuard)
@Controller('custom-requests/:requestId/files')
export class CustomBuildFilesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly processingJobs: ProcessingJobsService,
  ) {}

  @Post()
  async uploadReference(@Req() req: FastifyRequest, @Param('requestId') requestId: string) {
    const user = (req as FastifyRequest & { user?: { id: string } }).user;
    if (!user) throw new BadRequestException('Authentication is required');

    const request = await this.prisma.customRequest.findFirst({
      where: { id: requestId, userId: user.id },
      select: { id: true },
    });
    if (!request) throw new BadRequestException('Custom request not found');

    const uploaded = await this.readMultipart(req);
    if (!REFERENCE_MIME_TYPES.has(uploaded.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, WEBP and PDF references are supported');
    }

    const stored = await this.storage.saveCustomRequestFile(requestId, uploaded.filename, uploaded.buffer);
    try {
      return this.serialize(await this.prisma.customRequestMedia.create({
        data: {
          customRequestId: requestId,
          originalName: uploaded.filename,
          storageKey: stored.storageKey,
          storageUrl: stored.storageUrl,
          mimeType: uploaded.mimetype,
          fileSize: BigInt(uploaded.buffer.length),
        },
      }));
    } catch (error) {
      await this.storage.delete(stored.storageKey);
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Post('/preview')
  async uploadPreview(@Req() req: FastifyRequest, @Param('requestId') requestId: string) {
    const customRequest = await this.prisma.customRequest.findUnique({
      where: { id: requestId },
      select: { id: true, status: true },
    });
    if (!customRequest) throw new BadRequestException('Custom request not found');
    if (!['IN_PRODUCTION', 'REVISION_REQUESTED', 'PREVIEW_READY', 'CUSTOMER_REVIEW'].includes(customRequest.status)) {
      throw new BadRequestException('Custom request is not in a preview-production stage');
    }

    const uploaded = await this.readMultipart(req);
    const extension = extname(uploaded.filename).toLowerCase();
    const format = CUSTOM_PREVIEW_EXTENSIONS[extension];
    if (!format || uploaded.mimetype !== 'model/gltf-binary' && uploaded.mimetype !== 'model/gltf+json' && uploaded.mimetype !== 'application/octet-stream' && uploaded.mimetype !== 'application/json') {
      throw new BadRequestException('Custom previews must be GLB or GLTF files');
    }

    const stored = await this.storage.saveCustomRequestFile(requestId, uploaded.filename, uploaded.buffer);
    try {
      const file = await this.prisma.productFile.create({
        data: {
          productId: await this.ensurePreviewProduct(requestId),
          originalName: uploaded.filename,
          storageKey: stored.storageKey,
          storageUrl: stored.storageUrl,
          format,
          fileType: ProductFileType.MODEL,
          mimeType: uploaded.mimetype,
          fileSize: BigInt(uploaded.buffer.length),
          processingStatus: ProcessingStatus.PENDING,
        },
      });
      await this.processingJobs.create(file.id);
      return this.serialize(file);
    } catch (error) {
      await this.storage.delete(stored.storageKey);
      throw error;
    }
  }

  private async ensurePreviewProduct(requestId: string): Promise<string> {
    const request = await this.prisma.customRequest.findUnique({
      where: { id: requestId },
      select: { previewProductId: true },
    });

    if (request?.previewProductId) return request.previewProductId;

    const product = await this.prisma.product.create({
      data: {
        name: `Custom preview ${requestId}`,
        slug: `custom-preview-${requestId}`,
        status: 'DRAFT',
      },
      select: { id: true },
    });

    await this.prisma.customRequest.update({
      where: { id: requestId },
      data: { previewProductId: product.id },
    });

    return product.id;
  }

  private async readMultipart(req: FastifyRequest) {
    const multipart = (req as FastifyRequest & { file?: () => Promise<any> }).file;
    if (typeof multipart !== 'function') throw new BadRequestException('Multipart upload support is not available');
    const uploaded = await multipart();
    if (!uploaded) throw new BadRequestException('File is required');
    const buffer = await uploaded.toBuffer();
    if (!buffer.length) throw new BadRequestException('Uploaded file is empty');
    if (buffer.length > 512 * 1024 * 1024) throw new BadRequestException('File exceeds the 512 MB limit');
    return { filename: uploaded.filename as string, mimetype: uploaded.mimetype as string, buffer: buffer as Buffer };
  }

  private serialize<T extends { fileSize: bigint }>(file: T) {
    return { ...file, fileSize: Number(file.fileSize) };
  }
}
