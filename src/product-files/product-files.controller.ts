import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AdminGuard } from "../auth/guards/admin.guard";
import { ProductFilesService } from "./product-files.service";
import { StorageService } from "../storage/storage.service";

@UseGuards(AdminGuard)
@Controller("products/:productId/files")
export class ProductFilesController {
  constructor(
    private readonly productFilesService: ProductFilesService,
    private readonly storage: StorageService,
  ) {}

  @Post()
  async upload(
    @Param("productId") productId: string,
    @Res() reply: FastifyReply,
  ) {
    const request = reply.request as FastifyRequest & {
      file?: () => Promise<any>;
    };

    if (typeof request.file !== "function") {
      throw new BadRequestException("Multipart upload support is not available");
    }

    const uploadedFile = await request.file();
    if (!uploadedFile) throw new BadRequestException("File is required");

    const buffer = await uploadedFile.toBuffer();
    const file = {
      originalname: uploadedFile.filename,
      mimetype: uploadedFile.mimetype,
      size: buffer.length,
      buffer,
    };

    return reply.send(await this.productFilesService.upload(productId, file));
  }

  @Get()
  findAll(@Param("productId") productId: string) {
    return this.productFilesService.findAll(productId);
  }

  @Get(":fileId")
  findOne(
    @Param("productId") productId: string,
    @Param("fileId") fileId: string,
  ) {
    return this.productFilesService.findOne(productId, fileId);
  }

  @Get(":fileId/download")
  async preview(
    @Param("productId") productId: string,
    @Param("fileId") fileId: string,
  ) {
    const file = await this.productFilesService.findOne(productId, fileId);
    const path = this.storage.getAbsolutePath(file.storageKey);

    try {
      const { createReadStream } = await import("fs");
      const stream = createReadStream(path);
      const safeName = file.originalName.replace(/[\\/\r\n\"']/g, "_");

      return new StreamableFile(stream, {
        type: file.mimeType ?? "application/octet-stream",
        disposition: `inline; filename="${encodeURIComponent(safeName)}"`,
      });
    } catch {
      throw new NotFoundException("Stored file could not be found");
    }
  }

  @Delete(":fileId")
  delete(
    @Param("productId") productId: string,
    @Param("fileId") fileId: string,
  ) {
    return this.productFilesService.delete(productId, fileId);
  }
}
