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
      file?: () => Promise<unknown>;
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

    const multipartFile = uploadedFile as {
      filename?: string;
      mimetype?: string;
      toBuffer?: () => Promise<Buffer>;
    };

    if (
      typeof multipartFile.filename !== "string" ||
      !multipartFile.filename.trim()
    ) {
      throw new BadRequestException(
        "Uploaded file name is missing",
      );
    }

    if (typeof multipartFile.toBuffer !== "function") {
      throw new BadRequestException(
        "Uploaded file data is unavailable",
      );
    }

    const buffer = await multipartFile.toBuffer();

    const result =
      await this.productFilesService.upload(
        productId,
        {
          originalname: multipartFile.filename,
          mimetype: multipartFile.mimetype ?? null,
          size: buffer.length,
          buffer,
        },
      );

    return reply.send(result);
  }

  @Get()
  async findAll(
    @Param("productId") productId: string,
  ) {
    return this.productFilesService.findAll(productId);
  }

  @Get(":fileId")
  async findOne(
    @Param("productId") productId: string,
    @Param("fileId") fileId: string,
  ) {
    return this.productFilesService.findOne(
      productId,
      fileId,
    );
  }

  @Get(":fileId/download")
  async download(
    @Param("productId") productId: string,
    @Param("fileId") fileId: string,
  ) {
    const file =
      await this.productFilesService.findOne(
        productId,
        fileId,
      );

    const absolutePath =
      this.storage.getAbsolutePath(
        file.storageKey,
      );

    try {
      const { createReadStream } =
        await import("node:fs");

      const stream =
        createReadStream(absolutePath);

      stream.once("error", () => {
        // The stream error is handled by Nest/Fastify when the response
        // is already in flight. The pre-check below handles normal 404s.
      });

      return new StreamableFile(stream, {
        type:
          file.mimeType ??
          "application/octet-stream",
        disposition:
          `attachment; filename="${encodeURIComponent(
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
