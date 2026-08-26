export interface StoredFile {
  storageKey: string;
  storagePath: string;
  size: number;
}

export interface SaveFileOptions {
  productId: string;
  filename: string;
  stream: NodeJS.ReadableStream;
}