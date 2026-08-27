import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  StreamableFile,
  NotFoundException,
  Res,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { ProductFilesService } from "./product-files.service";
import { StorageService } from "../storage/storage.service";

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
      throw new BadRequestException(
        "Multipart upload support is not available",
      );
    }

    const uploadedFile = await request.file();

    if (!uploadedFile) {
      throw new BadRequestException("File is required");
    }

    const buffer = await uploadedFile.toBuffer();

    const file = {
      originalname: uploadedFile.filename,
      mimetype: uploadedFile.mimetype,
      size: buffer.length,
      buffer,
    };

    const result = await this.productFilesService.upload(
      productId,
      file,
    );

    return reply.send(result);
  }

  @Get()
  async findAll(@Param("productId") productId: string) {
    return this.productFilesService.findAll(productId);
  }

  @Get(":fileId")
  async findOne(
    @Param("productId") productId: string,
    @Param("fileId") fileId: string,
  ) {
    return this.productFilesService.findOne(productId, fileId);
  }

  @Get(":fileId/download")
  async download(
    @Param("productId") productId: string,
    @Param("fileId") fileId: string,
  ) {
    const file = await this.productFilesService.findOne(
      productId,
      fileId,
    );

    const path = this.storage.getAbsolutePath(file.storageKey);

    try {
      const stream = await import("fs").then(({ createReadStream }) =>
        createReadStream(path),
      );

      return new StreamableFile(stream, {
        type: file.mimeType ?? "application/octet-stream",
        disposition: `attachment; filename="${encodeURIComponent(
          file.originalName,
        )}"`,
      });
    } catch {
      throw new NotFoundException(
        "Stored file could not be found",
      );
    }
  }

  @Delete(":fileId")
  async delete(
    @Param("productId") productId: string,
    @Param("fileId") fileId: string,
  ) {
    return this.productFilesService.delete(
      productId,
      fileId,
    );
  }
}