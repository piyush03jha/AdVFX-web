import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  access,
  mkdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  extname,
  join,
  resolve,
  sep,
} from "node:path";

import type {
  SaveProductFileOptions,
  StoredFile,
} from "./storage.types";

@Injectable()
export class StorageService {
  private readonly root = resolve(
    process.env.STORAGE_ROOT ??
      join(process.cwd(), "storage"),
  );

  async saveProductFile(
    options: SaveProductFileOptions,
  ): Promise<StoredFile> {
    const productId = options.productId.trim();
    const originalName = options.filename.trim();

    if (!productId) {
      throw new BadRequestException(
        "Product ID is required",
      );
    }

    if (!originalName) {
      throw new BadRequestException(
        "File name is required",
      );
    }

    if (!options.buffer?.length) {
      throw new BadRequestException(
        "Uploaded file is empty",
      );
    }

    const extension = extname(originalName).toLowerCase();

    if (!extension) {
      throw new BadRequestException(
        "File extension is required",
      );
    }

    const safeBaseName = basename(
      originalName,
      extension,
    )
      .normalize("NFKC")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);

    const filename =
      `${randomUUID()}-${safeBaseName || "file"}${extension}`;

    const productDirectory = join(
      this.root,
      "products",
      productId,
    );

    await mkdir(productDirectory, {
      recursive: true,
    });

    const absolutePath = join(
      productDirectory,
      filename,
    );

    try {
      await writeFile(
        absolutePath,
        options.buffer,
      );
    } catch {
      throw new InternalServerErrorException(
        "Unable to store uploaded file",
      );
    }

    const storageKey = [
      "products",
      productId,
      filename,
    ].join("/");

    return {
      storageKey,
      storageUrl: `/storage/${storageKey}`,
      storagePath: absolutePath,
      size: options.buffer.length,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(storageKey);

    try {
      await unlink(absolutePath);
    } catch (error: unknown) {
      const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error
          ? (error as { code?: string }).code
          : undefined;

      if (code !== "ENOENT") {
        throw new InternalServerErrorException(
          "Unable to delete stored file",
        );
      }
    }
  }

  async exists(storageKey: string): Promise<boolean> {
    try {
      await access(this.getAbsolutePath(storageKey));
      return true;
    } catch {
      return false;
    }
  }

  getAbsolutePath(storageKey: string): string {
    const normalizedKey = storageKey.replace(/\\/g, "/");
    const absolutePath = resolve(this.root, normalizedKey);

    if (
      absolutePath !== this.root &&
      !absolutePath.startsWith(`${this.root}${sep}`)
    ) {
      throw new BadRequestException(
        "Invalid storage key",
      );
    }

    return absolutePath;
  }
}
