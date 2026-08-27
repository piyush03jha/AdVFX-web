import {
  ProductFileFormat,
  ProductFileType,
} from "@prisma/client";

/**
 * Supported product-file formats.
 *
 * 3D
 * - Alembic (.abc)
 * - Universal Scene Description (.usd)
 * - glTF 2.0 (.gltf/.glb)
 * - Wavefront OBJ (.obj)
 * - Stanford PLY (.ply)
 * - STL (.stl)
 * - Motion Capture (.bvh)
 * - FBX (.fbx)
 *
 * 2D
 * - PNG (.png)
 * - JPEG (.jpg/.jpeg)
 * - WEBP (.webp)
 * - SVG (.svg)
 *
 * Documents
 * - PDF (.pdf)
 */
export const SUPPORTED_EXTENSIONS = {
  // 3D
  ".abc": ProductFileFormat.ABC,
  ".usd": ProductFileFormat.USD,
  ".gltf": ProductFileFormat.GLTF,
  ".glb": ProductFileFormat.GLB,
  ".obj": ProductFileFormat.OBJ,
  ".ply": ProductFileFormat.PLY,
  ".stl": ProductFileFormat.STL,
  ".bvh": ProductFileFormat.BVH,
  ".fbx": ProductFileFormat.FBX,

  // 2D
  ".png": ProductFileFormat.PNG,
  ".jpg": ProductFileFormat.JPG,
  ".jpeg": ProductFileFormat.JPEG,
  ".webp": ProductFileFormat.WEBP,
  ".svg": ProductFileFormat.SVG,

  // Documents
  ".pdf": ProductFileFormat.PDF,
} as const;

export const MODEL_FORMATS = new Set<ProductFileFormat>([
  ProductFileFormat.ABC,
  ProductFileFormat.USD,
  ProductFileFormat.GLTF,
  ProductFileFormat.GLB,
  ProductFileFormat.OBJ,
  ProductFileFormat.PLY,
  ProductFileFormat.STL,
  ProductFileFormat.BVH,
  ProductFileFormat.FBX,
]);

export const IMAGE_FORMATS = new Set<ProductFileFormat>([
  ProductFileFormat.PNG,
  ProductFileFormat.JPG,
  ProductFileFormat.JPEG,
  ProductFileFormat.WEBP,
  ProductFileFormat.SVG,
]);

export const DOCUMENT_FORMATS = new Set<ProductFileFormat>([
  ProductFileFormat.PDF,
]);

export const MAX_UPLOAD_SIZE_BYTES =
  Number(process.env.MAX_UPLOAD_SIZE_MB ?? 2048) *
  1024 *
  1024;

export function getProductFileType(
  format: ProductFileFormat,
): ProductFileType {
  if (MODEL_FORMATS.has(format)) {
    return ProductFileType.MODEL;
  }

  if (IMAGE_FORMATS.has(format)) {
    return ProductFileType.IMAGE;
  }

  if (DOCUMENT_FORMATS.has(format)) {
    return ProductFileType.DOCUMENT;
  }

  throw new Error(
    `Unsupported product file format: ${format}`,
  );
}
