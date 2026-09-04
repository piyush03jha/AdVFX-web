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
<<<<<<< HEAD

=======
import { AdminGuard } from "../auth/guards/admin.guard";
>>>>>>> origin/feat/backend-catalog-admin-foundation
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
      file?: () => Promise<unknown>;
    };

    if (typeof request.file !== "function") {
      throw new BadRequestException("Multipart upload support is not available");
    }

    const uploadedFile = await request.file();
    if (!uploadedFile) throw new BadRequestException("File is required");

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/feat/backend-catalog-admin-foundation
    return this.productFilesService.findAll(productId);
  }

  @Get(":fileId")
  findOne(
    @Param("productId") productId: string,
    @Param("fileId") fileId: string,
  ) {
    return this.productFilesService.findOne(
      productId,
      fileId,
    );
  }

  @Get(":fileId/download")
  async preview(
    @Param("productId") productId: string,
    @Param("fileId") fileId: string,
  ) {
<<<<<<< HEAD
    const file =
      await this.productFilesService.findOne(
        productId,
        fileId,
      );
=======
    const file = await this.productFilesService.findOne(productId, fileId);
    const path = this.storage.getAbsolutePath(file.storageKey);

    try {
      const { createReadStream } = await import("fs");
      const stream = createReadStream(path);
      const safeName = file.originalName.replace(/[\\/\r\n\"']/g, "_");
>>>>>>> origin/feat/backend-catalog-admin-foundation

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
<<<<<<< HEAD
        type:
          file.mimeType ??
          "application/octet-stream",
        disposition:
          `attachment; filename="${encodeURIComponent(
            file.originalName,
          )}"`,
=======
        type: file.mimeType ?? "application/octet-stream",
        disposition: `inline; filename="${encodeURIComponent(safeName)}"`,
>>>>>>> origin/feat/backend-catalog-admin-foundation
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
