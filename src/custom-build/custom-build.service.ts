import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomRequestStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomRequestDto } from './dto/create-custom-request.dto';

const TRANSITIONS: Record<CustomRequestStatus, CustomRequestStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['IN_PRODUCTION', 'REVISION_REQUESTED'],
  IN_PRODUCTION: ['PREVIEW_READY'],
  PREVIEW_READY: ['CUSTOMER_REVIEW'],
  CUSTOMER_REVIEW: ['REVISION_REQUESTED', 'APPROVED'],
  REVISION_REQUESTED: ['IN_PRODUCTION'],
  APPROVED: ['ORDERABLE'],
  ORDERABLE: [],
  CANCELLED: [],
};

@Injectable()
export class CustomBuildService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCustomRequestDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.customRequest.create({
      data: {
        userId,
        title: dto.title.trim(),
        requirements: dto.requirements.trim(),
        dimensions: dto.dimensions?.trim() || null,
        preferredMaterial: dto.preferredMaterial?.trim() || null,
        preferredScale: dto.preferredScale?.trim() || null,
        notes: dto.notes?.trim() || null,
        referenceFileCount: dto.referenceFileCount ?? 0,
        status: 'SUBMITTED',
      },
      include: { media: true, preview: true, quote: true },
    });
  }

  async mine(userId: string) {
    return this.prisma.customRequest.findMany({
      where: { userId },
      include: { media: true, preview: true, quote: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async mineOne(userId: string, id: string) {
    const request = await this.prisma.customRequest.findFirst({
      where: { id, userId },
      include: { media: true, preview: true, quote: true, previewProduct: { include: { files: true, media: true } } },
    });
    if (!request) throw new NotFoundException('Custom request not found');
    return request;
  }

  async findAllAdmin(status?: CustomRequestStatus) {
    return this.prisma.customRequest.findMany({
      where: status ? { status } : undefined,
      include: { user: true, media: true, preview: true, quote: true, previewProduct: { include: { files: true, media: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneAdmin(id: string) {
    const request = await this.prisma.customRequest.findUnique({
      where: { id },
      include: { user: true, media: true, preview: true, quote: true, previewProduct: { include: { files: true, media: true } } },
    });
    if (!request) throw new NotFoundException('Custom request not found');
    return request;
  }

  async updateStatus(id: string, status: CustomRequestStatus) {
    const request = await this.findOneAdmin(id);
    const allowed = TRANSITIONS[request.status];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`Cannot change custom request from ${request.status} to ${status}`);
    }
    return this.prisma.customRequest.update({
      where: { id },
      data: { status },
      include: { user: true, media: true, preview: true, quote: true, previewProduct: true },
    });
  }

  async upsertPreview(id: string, url: string) {
    if (!url.trim()) throw new BadRequestException('Preview URL is required');
    await this.findOneAdmin(id);
    const preview = await this.prisma.customRequestPreview.upsert({
      where: { customRequestId: id },
      create: { customRequestId: id, url: url.trim(), status: 'READY' },
      update: { url: url.trim(), status: 'READY' },
    });
    await this.prisma.customRequest.update({
      where: { id },
      data: { status: 'CUSTOMER_REVIEW' },
    });
    return preview;
  }

  async approve(userId: string, id: string) {
    const request = await this.mineOne(userId, id);
    if (!['CUSTOMER_REVIEW', 'PREVIEW_READY'].includes(request.status)) {
      throw new BadRequestException('Custom model is not ready for approval');
    }
    return this.prisma.customRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: { media: true, preview: true, quote: true, previewProduct: true },
    });
  }

  async requestRevision(userId: string, id: string, note?: string) {
    const request = await this.mineOne(userId, id);
    if (!['CUSTOMER_REVIEW', 'PREVIEW_READY'].includes(request.status)) {
      throw new BadRequestException('Custom model is not ready for revision');
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.customRequest.update({
        where: { id },
        data: { status: 'REVISION_REQUESTED' },
        include: { media: true, preview: true, quote: true, previewProduct: true },
      });
      if (note?.trim()) {
        await tx.customRequestRevision.create({
          data: { customRequestId: id, requestedById: userId, note: note.trim() },
        });
      }
      return updated;
    });
  }

  async ensurePreviewProduct(id: string) {
    const request = await this.prisma.customRequest.findUnique({
      where: { id },
      select: { previewProductId: true },
    });
    if (request?.previewProductId) return request.previewProductId;

    const product = await this.prisma.product.create({
      data: {
        name: `Custom preview ${id}`,
        slug: `custom-preview-${id}`,
        status: 'DRAFT',
        inventory: { create: { stock: 0, trackStock: false } },
      },
      select: { id: true },
    });

    await this.prisma.customRequest.update({
      where: { id },
      data: { previewProductId: product.id },
    });
    return product.id;
  }
}
