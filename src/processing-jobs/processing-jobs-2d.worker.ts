import { Injectable, Logger } from "@nestjs/common";
import {
  ProductFileFormat,
  ProductFileType,
} from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

@Injectable()
export class ProcessingJobs2DWorker {
  private readonly logger = new Logger(
    ProcessingJobs2DWorker.name,
  );

  /**
   * Process an IMAGE or DOCUMENT ProductFile.
   *
   * Phase 2D currently performs:
   *
   * IMAGE
   *   PNG
   *   JPG
   *   JPEG
   *   WEBP
   *   SVG
   *
   * DOCUMENT
   *   PDF
   *
   * Processing currently means validating that the stored
   * file is structurally valid.
   */
  async processFile(productFile: {
    id: string;
    fileType: ProductFileType;
    format: ProductFileFormat;
    storageKey: string;
    fileSize: bigint;
  }): Promise<void> {
    if (productFile.fileType === ProductFileType.IMAGE) {
      await this.processImage(productFile);
      return;
    }

    if (productFile.fileType === ProductFileType.DOCUMENT) {
      await this.processDocument(productFile);
      return;
    }

    throw new Error(
      `Unsupported 2D file type: ${productFile.fileType}`,
    );
  }

  /**
   * ============================================================
   * IMAGE PROCESSING
   * ============================================================
   */
  private async processImage(productFile: {
    id: string;
    format: ProductFileFormat;
    storageKey: string;
    fileSize: bigint;
  }): Promise<void> {
    this.logger.log(
      `Validating image ${productFile.id} (${productFile.format})`,
    );

    const filePath = this.resolveStoragePath(
      productFile.storageKey,
    );

    const buffer = await fs.readFile(filePath);

    if (buffer.length === 0) {
      throw new Error("Image file is empty");
    }

    switch (productFile.format) {
      case ProductFileFormat.PNG:
        this.validatePng(buffer);
        break;

      case ProductFileFormat.JPG:
      case ProductFileFormat.JPEG:
        this.validateJpeg(buffer);
        break;

      case ProductFileFormat.WEBP:
        this.validateWebp(buffer);
        break;

      case ProductFileFormat.SVG:
        this.validateSvg(buffer);
        break;

      default:
        throw new Error(
          `Image format ${productFile.format} is not supported by the 2D processor`,
        );
    }

    this.logger.log(
      `Image ${productFile.id} passed validation`,
    );
  }

  /**
   * ============================================================
   * DOCUMENT PROCESSING
   * ============================================================
   */
  private async processDocument(productFile: {
    id: string;
    format: ProductFileFormat;
    storageKey: string;
    fileSize: bigint;
  }): Promise<void> {
    if (productFile.format !== ProductFileFormat.PDF) {
      throw new Error(
        `Document format ${productFile.format} is not supported yet`,
      );
    }

    const filePath = this.resolveStoragePath(
      productFile.storageKey,
    );

    const buffer = await fs.readFile(filePath);

    if (buffer.length === 0) {
      throw new Error("PDF file is empty");
    }

    this.validatePdf(buffer);

    this.logger.log(
      `PDF ${productFile.id} passed validation`,
    );
  }

  /**
   * ============================================================
   * PNG
   * ============================================================
   *
   * PNG signature:
   *
   * 89 50 4E 47 0D 0A 1A 0A
   */
  private validatePng(buffer: Buffer): void {
    const signature = Buffer.from([
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a,
    ]);

    if (
      buffer.length < signature.length ||
      !buffer.subarray(
        0,
        signature.length,
      ).equals(signature)
    ) {
      throw new Error(
        "Invalid PNG: invalid file signature",
      );
    }
  }

  /**
   * ============================================================
   * JPEG
   * ============================================================
   *
   * JPEG starts with:
   *
   * FF D8 FF
   *
   * and normally ends with:
   *
   * FF D9
   */
  private validateJpeg(buffer: Buffer): void {
    if (buffer.length < 4) {
      throw new Error(
        "Invalid JPEG: file is too small",
      );
    }

    const validStart =
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff;

    const validEnd =
      buffer[buffer.length - 2] === 0xff &&
      buffer[buffer.length - 1] === 0xd9;

    if (!validStart || !validEnd) {
      throw new Error(
        "Invalid JPEG: invalid file signature",
      );
    }
  }

  /**
   * ============================================================
   * WEBP
   * ============================================================
   *
   * WEBP uses RIFF container:
   *
   * bytes 0-3  = RIFF
   * bytes 8-11 = WEBP
   */
  private validateWebp(buffer: Buffer): void {
    if (buffer.length < 12) {
      throw new Error(
        "Invalid WEBP: file is too small",
      );
    }

    const riff =
      buffer.toString(
        "ascii",
        0,
        4,
      ) === "RIFF";

    const webp =
      buffer.toString(
        "ascii",
        8,
        12,
      ) === "WEBP";

    if (!riff || !webp) {
      throw new Error(
        "Invalid WEBP: invalid RIFF/WEBP signature",
      );
    }
  }

  /**
   * ============================================================
   * SVG
   * ============================================================
   *
   * SVG is XML/text rather than a binary format.
   *
   * We perform basic structural validation rather than attempting
   * to fully parse/render SVG here.
   */
  private validateSvg(buffer: Buffer): void {
    const content =
      buffer
        .toString("utf8")
        .replace(/^\uFEFF/, "")
        .trim();

    if (!content) {
      throw new Error(
        "Invalid SVG: file is empty",
      );
    }

    const hasSvgElement =
      /<svg(?:\s|>)/i.test(content);

    if (!hasSvgElement) {
      throw new Error(
        "Invalid SVG: <svg> element not found",
      );
    }
  }

  /**
   * ============================================================
   * PDF
   * ============================================================
   *
   * PDF header:
   *
   * %PDF-
   */
  private validatePdf(buffer: Buffer): void {
    if (buffer.length < 5) {
      throw new Error(
        "Invalid PDF: file is too small",
      );
    }

    const header =
      buffer.toString(
        "ascii",
        0,
        5,
      );

    if (header !== "%PDF-") {
      throw new Error(
        `Invalid PDF: invalid header "${header}"`,
      );
    }
  }

  /**
   * ============================================================
   * STORAGE PATH
   * ============================================================
   *
   * storageKey examples:
   *
   * products/<productId>/<uuid>-image.png
   *
   * The storage root is controlled through STORAGE_ROOT.
   */
  private resolveStoragePath(
    storageKey: string,
  ): string {
    const storageRoot =
      process.env.STORAGE_ROOT ??
      path.join(process.cwd(), "storage");

    const normalizedRoot =
      path.resolve(storageRoot);

    const resolvedPath =
      path.resolve(
        normalizedRoot,
        storageKey,
      );

    /*
     * Prevent path traversal.
     */
    if (
      resolvedPath !== normalizedRoot &&
      !resolvedPath.startsWith(
        `${normalizedRoot}${path.sep}`,
      )
    ) {
      throw new Error(
        "Invalid storage key",
      );
    }

    return resolvedPath;
  }
}