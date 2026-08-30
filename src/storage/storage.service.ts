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

  async saveProductFile(
    productId: string,
    originalName: string,
    buffer: Buffer,
  ): Promise<{
    storageKey: string;
    storageUrl: string;
  }> {
    return this.saveScopedFile(
      ["products", productId],
      originalName,
      buffer,
    );
  }

  async saveCustomRequestFile(
    requestId: string,
    originalName: string,
    buffer: Buffer,
  ): Promise<{
    storageKey: string;
    storageUrl: string;
  }> {
    return this.saveScopedFile(
      ["custom-requests", requestId],
      originalName,
      buffer,
    );
  }

  async delete(storageKey: string): Promise<void> {
    const absolutePath = join(this.root, storageKey);

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

  getAbsolutePath(storageKey: string): string {
    return join(this.root, storageKey);
  }

  private async saveScopedFile(
    segments: string[],
    originalName: string,
    buffer: Buffer,
  ): Promise<{
    storageKey: string;
    storageUrl: string;
  }> {
    const extension = extname(originalName).toLowerCase();

    if (!extension) {
      throw new BadRequestException(
        "File extension is required",
      );
    }

    const directory = join(this.root, ...segments);
    await mkdir(directory, { recursive: true });

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

    const absolutePath = join(directory, filename);

    try {
      await writeFile(absolutePath, buffer);
    } catch {
      throw new InternalServerErrorException(
        "Unable to store uploaded file",
      );
    }

    const storageKey = [...segments, filename].join("/");

    return {
      storageKey,
      storageUrl: `/storage/${storageKey}`,
    };
  }
}
