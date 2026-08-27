import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { extname } from "node:path";
import { ProductFileFormat } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { ProcessingJobsService } from "../processing-jobs/processing-jobs.service";
import { StorageService } from "../storage/storage.service";

import {
  DOCUMENT_FORMATS,
  IMAGE_FORMATS,
  MAX_UPLOAD_SIZE_BYTES,
  MODEL_FORMATS,
  SUPPORTED_EXTENSIONS,
  getProductFileType,
} from "./product-file.constants";

interface UploadedProductFile {
  originalname: string;
  mimetype?: string | null;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class ProductFilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly processingJobs: ProcessingJobsService,
  ) {}

  /**
   * Upload a product asset, persist its metadata, and enqueue processing.
   */
  async upload(
    productId: string,
    file: UploadedProductFile,
  ) {
    await this.ensureProductExists(productId);

    if (!file) {
      throw new BadRequestException("File is required");
    }

    if (!file.buffer?.length || file.size <= 0) {
      throw new BadRequestException("Uploaded file is empty");
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      throw new BadRequestException(
        `File exceeds the maximum upload size of ${
          process.env.MAX_UPLOAD_SIZE_MB ?? 2048
        } MB`,
      );
    }

    const extension = extname(
      file.originalname,
    ).toLowerCase();

    const format =
      SUPPORTED_EXTENSIONS[
        extension as keyof typeof SUPPORTED_EXTENSIONS
      ];

    if (!format) {
      throw new BadRequestException(
        `Unsupported file format "${extension || "unknown"}". Supported formats: ${Object.keys(
          SUPPORTED_EXTENSIONS,
        ).join(", ")}`,
      );
    }

    this.validateMimeType(
      format,
      file.mimetype ?? undefined,
    );

    const fileType = getProductFileType(format);

    const stored =
      await this.storage.saveProductFile({
        productId,
        filename: file.originalname,
        buffer: file.buffer,
      });

    let createdFileId: string | null = null;

    try {
      const created =
        await this.prisma.productFile.create({
          data: {
            productId,
            originalName: file.originalname,
            storageKey: stored.storageKey,
            storageUrl: stored.storageUrl,
            format,
            fileType,
            mimeType: this.getCanonicalMimeType(
              format,
              file.mimetype ?? undefined,
            ),
            fileSize: BigInt(file.size),
            processingStatus: "PENDING",
          },
        });

      createdFileId = created.id;

      /**
       * Queue processing immediately. The job service protects against
       * duplicate active jobs for the same ProductFile.
       */
      await this.processingJobs.create(created.id);

      return this.serializeFile(created);
    } catch (error) {
      if (createdFileId) {
        try {
          await this.prisma.productFile.delete({
            where: {
              id: createdFileId,
            },
          });
        } catch {
          // Preserve the original error. A cleanup failure should not mask it.
        }
      }

      await this.storage.delete(
        stored.storageKey,
      );

      throw error;
    }
  }

  /**
   * Get all files belonging to a product.
   */
  async findAll(productId: string) {
    await this.ensureProductExists(productId);

    const files =
      await this.prisma.productFile.findMany({
        where: {
          productId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return files.map((file) =>
      this.serializeFile(file),
    );
  }

  /**
   * Get one file belonging to a product.
   */
  async findOne(
    productId: string,
    fileId: string,
  ) {
    const file =
      await this.prisma.productFile.findFirst({
        where: {
          id: fileId,
          productId,
        },
      });

    if (!file) {
      throw new NotFoundException(
        `Product file "${fileId}" not found`,
      );
    }

    return this.serializeFile(file);
  }

  /**
   * Delete a product file and all processing jobs that belong to it.
   */
  async delete(
    productId: string,
    fileId: string,
  ) {
    const file =
      await this.prisma.productFile.findFirst({
        where: {
          id: fileId,
          productId,
        },
        select: {
          id: true,
          storageKey: true,
        },
      });

    if (!file) {
      throw new NotFoundException(
        `Product file "${fileId}" not found`,
      );
    }

    /**
     * ProductFileProcessingJob has onDelete: Cascade, so deleting the
     * ProductFile removes its source jobs as well.
     */
    await this.prisma.productFile.delete({
      where: {
        id: file.id,
      },
    });

    await this.storage.delete(
      file.storageKey,
    );

    return {
      message:
        "Product file deleted successfully",
    };
  }

  private async ensureProductExists(
    productId: string,
  ) {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
        },
      });

    if (!product) {
      throw new NotFoundException(
        `Product "${productId}" not found`,
      );
    }
  }

  private serializeFile<
    T extends {
      fileSize: bigint;
    },
  >(file: T) {
    return {
      ...file,
      fileSize: file.fileSize.toString(),
    };
  }

  /**
   * Normalize client-provided MIME values to stable application values.
   */
  private getCanonicalMimeType(
    format: ProductFileFormat,
    providedMimeType?: string,
  ): string | null {
    switch (format) {
      case ProductFileFormat.PNG:
        return "image/png";
      case ProductFileFormat.JPG:
      case ProductFileFormat.JPEG:
        return "image/jpeg";
      case ProductFileFormat.WEBP:
        return "image/webp";
      case ProductFileFormat.SVG:
        return "image/svg+xml";
      case ProductFileFormat.PDF:
        return "application/pdf";
      case ProductFileFormat.GLB:
        return "model/gltf-binary";
      case ProductFileFormat.GLTF:
        return "model/gltf+json";
      default:
        return providedMimeType?.trim() || null;
    }
  }

  /**
   * Validate client MIME hints where a stable MIME is expected.
   * Generic application/octet-stream is accepted for model files because
   * many clients do not provide useful model MIME types.
   */
  private validateMimeType(
    format: ProductFileFormat,
    mimeType?: string,
  ) {
    if (!mimeType) {
      return;
    }

    const normalized = mimeType
      .split(";", 1)[0]
      .trim()
      .toLowerCase();

    if (MODEL_FORMATS.has(format)) {
      const allowed = new Set([
        "application/octet-stream",
        "application/json",
        "model/gltf+json",
        "model/gltf-binary",
        "model/obj",
        "model/stl",
        "text/plain",
        "application/vnd.ms-pki.stl",
        "application/x-tgif",
        "application/x-3ds",
        "application/x-blender",
      ]);

      if (!allowed.has(normalized)) {
        throw new BadRequestException(
          `Unexpected MIME type "${mimeType}" for ${format}`,
        );
      }

      return;
    }

    if (IMAGE_FORMATS.has(format)) {
      const allowedByFormat: Partial<
        Record<ProductFileFormat, Set<string>>
      > = {
        [ProductFileFormat.PNG]: new Set([
          "image/png",
        ]),
        [ProductFileFormat.JPG]: new Set([
          "image/jpeg",
        ]),
        [ProductFileFormat.JPEG]: new Set([
          "image/jpeg",
        ]),
        [ProductFileFormat.WEBP]: new Set([
          "image/webp",
        ]),
        [ProductFileFormat.SVG]: new Set([
          "image/svg+xml",
          "text/xml",
          "application/xml",
        ]),
      };

      const allowed =
        allowedByFormat[format];

      if (
        allowed &&
        !allowed.has(normalized) &&
        normalized !== "application/octet-stream"
      ) {
        throw new BadRequestException(
          `Unexpected MIME type "${mimeType}" for ${format}`,
        );
      }

      return;
    }

    if (DOCUMENT_FORMATS.has(format)) {
      if (
        format === ProductFileFormat.PDF &&
        normalized !== "application/pdf" &&
        normalized !== "application/octet-stream"
      ) {
        throw new BadRequestException(
          `Unexpected MIME type "${mimeType}" for PDF`,
        );
      }
    }
  }
}
