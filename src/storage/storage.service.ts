import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  mkdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  extname,
  join,
} from "node:path";

@Injectable()
export class StorageService {
  private readonly root = join(
    process.cwd(),
    "storage",
  );

  /**
   * ============================================================
   * SAVE PRODUCT FILE
   * ============================================================
   *
   * Stores an uploaded product file on disk.
   *
   * PostgreSQL stores only the metadata/storageKey.
   */
  async saveProductFile(
    productId: string,
    originalName: string,
    buffer: Buffer,
  ): Promise<{
    storageKey: string;
    storageUrl: string;
  }> {
    const extension = extname(
      originalName,
    ).toLowerCase();

    if (!extension) {
      throw new BadRequestException(
        "File extension is required",
      );
    }

    const directory = join(
      this.root,
      "products",
      productId,
    );

    await mkdir(directory, {
      recursive: true,
    });

    const safeBaseName = basename(
      originalName,
      extension,
    )
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100);

    const filename =
      `${randomUUID()}-${safeBaseName || "file"}${extension}`;

    const absolutePath = join(
      directory,
      filename,
    );

    try {
      await writeFile(
        absolutePath,
        buffer,
      );
    } catch {
      throw new InternalServerErrorException(
        "Unable to store uploaded file",
      );
    }

    const storageKey =
      `products/${productId}/${filename}`;

    return {
      storageKey,
      storageUrl:
        `/storage/${storageKey}`,
    };
  }

  /**
   * ============================================================
   * DELETE FILE
   * ============================================================
   */
  async delete(
    storageKey: string,
  ): Promise<void> {
    const absolutePath = join(
      this.root,
      storageKey,
    );

    try {
      await unlink(absolutePath);
    } catch (error: any) {
      if (error?.code !== "ENOENT") {
        throw new InternalServerErrorException(
          "Unable to delete stored file",
        );
      }
    }
  }

  /**
   * ============================================================
   * GET ABSOLUTE FILE PATH
   * ============================================================
   *
   * Used by processing workers to read
   * an uploaded file from disk.
   */
  getAbsolutePath(
    storageKey: string,
  ): string {
    return join(
      this.root,
      storageKey,
    );
  }
}