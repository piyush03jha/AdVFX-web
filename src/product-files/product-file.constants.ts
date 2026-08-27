import {
  ProductFileFormat,
  ProductFileType,
} from "@prisma/client";

/**
 * ============================================================
 * SUPPORTED FILE EXTENSIONS
 * ============================================================
 *
 * Maps the uploaded file extension to the Prisma file format.
 *
 * Keep extensions lowercase because upload validation normalizes
 * the extension before looking it up.
 */
export const SUPPORTED_EXTENSIONS = {
  // 3D formats
  ".abc": ProductFileFormat.ABC,
  ".usd": ProductFileFormat.USD,
  ".usda": ProductFileFormat.USDA,
  ".usdc": ProductFileFormat.USDC,
  ".obj": ProductFileFormat.OBJ,
  ".ply": ProductFileFormat.PLY,
  ".stl": ProductFileFormat.STL,
  ".bvh": ProductFileFormat.BVH,
  ".fbx": ProductFileFormat.FBX,
  ".glb": ProductFileFormat.GLB,
  ".gltf": ProductFileFormat.GLTF,

  // 2D image formats
  ".png": ProductFileFormat.PNG,
  ".jpg": ProductFileFormat.JPG,
  ".jpeg": ProductFileFormat.JPEG,
  ".webp": ProductFileFormat.WEBP,
  ".svg": ProductFileFormat.SVG,

  // Documents
  ".pdf": ProductFileFormat.PDF,
} as const;

/**
 * ============================================================
 * 3D FORMATS
 * ============================================================
 */
export const MODEL_FORMATS = new Set<ProductFileFormat>([
  ProductFileFormat.ABC,
  ProductFileFormat.USD,
  ProductFileFormat.USDA,
  ProductFileFormat.USDC,
  ProductFileFormat.OBJ,
  ProductFileFormat.PLY,
  ProductFileFormat.STL,
  ProductFileFormat.BVH,
  ProductFileFormat.FBX,
  ProductFileFormat.GLB,
  ProductFileFormat.GLTF,
]);

/**
 * ============================================================
 * IMAGE FORMATS
 * ============================================================
 *
 * These files belong to ProductFileType.IMAGE.
 *
 * Phase 2D will process/validate these files separately from
 * 3D model processing.
 */
export const IMAGE_FORMATS = new Set<ProductFileFormat>([
  ProductFileFormat.PNG,
  ProductFileFormat.JPG,
  ProductFileFormat.JPEG,
  ProductFileFormat.WEBP,
  ProductFileFormat.SVG,
]);

/**
 * ============================================================
 * DOCUMENT FORMATS
 * ============================================================
 */
export const DOCUMENT_FORMATS = new Set<ProductFileFormat>([
  ProductFileFormat.PDF,
]);

/**
 * ============================================================
 * UPLOAD LIMIT
 * ============================================================
 *
 * Default: 2048 MB
 */
export const MAX_UPLOAD_SIZE_BYTES =
  Number(process.env.MAX_UPLOAD_SIZE_MB ?? 2048) * 1024 * 1024;

/**
 * ============================================================
 * FILE TYPE RESOLUTION
 * ============================================================
 */
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