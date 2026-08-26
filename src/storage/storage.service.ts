import {
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { pipeline } from "node:stream/promises";

import type {
  SaveFileOptions,
  StoredFile,
} from "./storage.types";

@Injectable()
export class StorageService {
  private readonly rootDirectory = join(
    process.cwd(),
    "storage",
  );

  async saveFile(
    options: SaveFileOptions,
  ): Promise<StoredFile> {
    const extension = extname(
      basename(options.filename),
    ).toLowerCase();

    const safeFilename = `${randomUUID()}${extension}`;

    const productDirectory = join(
      this.rootDirectory,
      "products",
      options.productId,
    );

    await mkdir(productDirectory, {
      recursive: true,
    });

    const storagePath = join(
      productDirectory,
      safeFilename,
    );

    const storageKey = [
      "products",
      options.productId,
      safeFilename,
    ].join("/");

    try {
      await pipeline(
        options.stream,
        createWriteStream(storagePath),
      );
    } catch {
      throw new InternalServerErrorException(
        "Failed to store uploaded file.",
      );
    }

    return {
      storageKey,
      storagePath,
      size: 0,
    };
  }
}