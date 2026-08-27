import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { ProductFileFormat } from "@prisma/client";
import { extname } from "path";

import {
  MAX_UPLOAD_SIZE_BYTES,
  MODEL_FORMATS,
  SUPPORTED_EXTENSIONS,
  getProductFileType,
} from "./product-file.constants";

import { StorageService } from "../storage/storage.service";
import { ProcessingJobsService } from "../processing-jobs/processing-jobs.service";

@Injectable()
export class ProductFilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly processingJobs: ProcessingJobsService,
  ) {}

    /**
     * ProcessingJobsModule imports ProductFilesModule,
     * so this dependency is circular.
     *
     * forwardRef allows NestJS to resolve it correctly.
     */

  /**
   * ============================================================
   * UPLOAD PRODUCT FILE
   * ============================================================
   */
  async upload(
    productId: string,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ) {
    /**
     * ----------------------------------------------------------
     * Make sure the product exists.
     * ----------------------------------------------------------
     */
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

    /**
     * ----------------------------------------------------------
     * Make sure a file was actually uploaded.
     * ----------------------------------------------------------
     */
    if (!file) {
      throw new BadRequestException(
        "File is required",
      );
    }

    /**
     * ----------------------------------------------------------
     * Reject empty files.
     * ----------------------------------------------------------
     */
    if (file.size <= 0) {
      throw new BadRequestException(
        "Uploaded file is empty",
      );
    }

    /**
     * ----------------------------------------------------------
     * Validate maximum upload size.
     * ----------------------------------------------------------
     */
    if (
      file.size >
      MAX_UPLOAD_SIZE_BYTES
    ) {
      throw new BadRequestException(
        `File exceeds the maximum upload size of ${
          process.env.MAX_UPLOAD_SIZE_MB ??
          2048
        } MB`,
      );
    }

    /**
     * ----------------------------------------------------------
     * Determine extension.
     *
     * Examples:
     *
     * character.fbx -> .fbx
     * model.glb     -> .glb
     * image.png     -> .png
     * image.webp    -> .webp
     * ----------------------------------------------------------
     */
    const extension = extname(
      file.originalname,
    ).toLowerCase();

    /**
     * ----------------------------------------------------------
     * Convert extension into Prisma enum.
     * ----------------------------------------------------------
     */
    const format =
      SUPPORTED_EXTENSIONS[
        extension as keyof typeof SUPPORTED_EXTENSIONS
      ];

    if (!format) {
      throw new BadRequestException(
        `Unsupported file format "${extension}". Supported formats: ${Object.keys(
          SUPPORTED_EXTENSIONS,
        ).join(", ")}`,
      );
    }

    /**
     * ----------------------------------------------------------
     * Validate MIME type.
     * ----------------------------------------------------------
     */
    this.validateMimeType(
      format,
      file.mimetype,
    );

    /**
     * ----------------------------------------------------------
     * Determine general file category.
     *
     * MODEL
     * IMAGE
     * DOCUMENT
     * ----------------------------------------------------------
     */
    const fileType =
      getProductFileType(format);

    /**
     * ----------------------------------------------------------
     * Store physical file.
     *
     * PostgreSQL stores metadata only.
     * ----------------------------------------------------------
     */
    const stored =
      await this.storage.saveProductFile(
        productId,
        file.originalname,
        file.buffer,
      );

    try {
      /**
       * ========================================================
       * CREATE PRODUCT FILE RECORD
       * ========================================================
       */
      const created =
        await this.prisma.productFile.create({
          data: {
            productId,

            originalName:
              file.originalname,

            storageKey:
              stored.storageKey,

            storageUrl:
              stored.storageUrl,

            format,

            fileType,

            mimeType:
              file.mimetype || null,

            /**
             * Prisma schema uses BigInt.
             */
            fileSize:
              BigInt(file.size),

            /**
             * Newly uploaded files must wait
             * for the processing worker.
             */
            processingStatus:
              "PENDING",
          },
        });

      /**
       * ========================================================
       * AUTOMATICALLY CREATE PROCESSING JOB
       * ========================================================
       *
       * Before this change you had to manually run:
       *
       * POST /processing-jobs
       *
       * Now every uploaded file automatically gets
       * a processing job.
       */
      await this.processingJobs.create(created.id);

      /**
       * --------------------------------------------------------
       * Return serialized file.
       *
       * BigInt cannot be JSON serialized by Fastify.
       * --------------------------------------------------------
       */
      return this.serializeFile(
        created,
      );
    } catch (error) {
      /**
       * --------------------------------------------------------
       * If database/job creation fails,
       * remove the physical file.
       * --------------------------------------------------------
       */
      await this.storage.delete(
        stored.storageKey,
      );

      throw error;
    }
  }

  /**
   * ============================================================
   * GET ALL FILES FOR PRODUCT
   * ============================================================
   */
  async findAll(
    productId: string,
  ) {
    await this.ensureProductExists(
      productId,
    );

    const files =
      await this.prisma.productFile.findMany(
        {
          where: {
            productId,
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      );

    /**
     * Convert BigInt values before returning.
     */
    return files.map((file) =>
      this.serializeFile(file),
    );
  }

  /**
   * ============================================================
   * GET SINGLE FILE
   * ============================================================
   */
  async findOne(
    productId: string,
    fileId: string,
  ) {
    const file =
      await this.prisma.productFile.findFirst(
        {
          where: {
            id: fileId,
            productId,
          },
        },
      );

    if (!file) {
      throw new NotFoundException(
        `Product file "${fileId}" not found`,
      );
    }

    return this.serializeFile(
      file,
    );
  }

  /**
   * ============================================================
   * DELETE FILE
   * ============================================================
   */
  async delete(
    productId: string,
    fileId: string,
  ) {
    /**
     * ----------------------------------------------------------
     * Find file first.
     * ----------------------------------------------------------
     */
    const file =
      await this.prisma.productFile.findFirst(
        {
          where: {
            id: fileId,
            productId,
          },
        },
      );

    if (!file) {
      throw new NotFoundException(
        `Product file "${fileId}" not found`,
      );
    }

    /**
     * ----------------------------------------------------------
     * Delete database record first.
     * ----------------------------------------------------------
     */
    await this.prisma.productFile.delete({
      where: {
        id: file.id,
      },
    });

    /**
     * ----------------------------------------------------------
     * Delete physical file.
     * ----------------------------------------------------------
     */
    await this.storage.delete(
      file.storageKey,
    );

    return {
      message:
        "Product file deleted successfully",
    };
  }

  /**
   * ============================================================
   * ENSURE PRODUCT EXISTS
   * ============================================================
   */
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

  /**
   * ============================================================
   * SERIALIZE PRODUCT FILE
   * ============================================================
   *
   * Prisma returns:
   *
   * fileSize: bigint
   *
   * Fastify cannot serialize bigint.
   *
   * Convert it to a normal number.
   */
  private serializeFile<
    T extends {
      fileSize: bigint;
    },
  >(file: T) {
    return {
      ...file,

      fileSize:
        Number(file.fileSize),
    };
  }

  /**
   * ============================================================
   * MIME TYPE VALIDATION
   * ============================================================
   */
  private validateMimeType(
    format: ProductFileFormat,
    mimeType: string,
  ) {
    /**
     * Some clients/proxies may not provide
     * a MIME type.
     */
    if (!mimeType) {
      return;
    }

    /**
     * ========================================================
     * 3D / MODEL FORMATS
     * ========================================================
     */
    if (
      MODEL_FORMATS.has(format)
    ) {
      const allowedMimeTypes = [
        "application/octet-stream",
        "application/json",
        "model/gltf+json",
        "model/gltf-binary",
        "application/vnd.ms-pki.stl",
        "text/plain",
        "application/x-tgif",

        /**
         * Additional common MIME types.
         */
        "model/obj",
        "model/stl",
        "application/x-3ds",
        "application/x-blender",
      ];

      if (
        !allowedMimeTypes.includes(
          mimeType,
        )
      ) {
        throw new BadRequestException(
          `Unexpected MIME type "${mimeType}" for ${format}`,
        );
      }

      return;
    }

    /**
     * ========================================================
     * SVG
     * ========================================================
     */
    if (
      format ===
        ProductFileFormat.SVG &&
      ![
        "image/svg+xml",
        "text/xml",
        "application/xml",
      ].includes(mimeType)
    ) {
      throw new BadRequestException(
        `Unexpected MIME type "${mimeType}" for SVG`,
      );
    }

    /**
     * ========================================================
     * PDF
     * ========================================================
     */
    if (
      format ===
        ProductFileFormat.PDF &&
      mimeType !==
        "application/pdf"
    ) {
      throw new BadRequestException(
        `Unexpected MIME type "${mimeType}" for PDF`,
      );
    }
  }
}