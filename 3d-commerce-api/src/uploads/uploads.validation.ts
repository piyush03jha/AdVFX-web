export const SUPPORTED_EXTENSIONS = [
  '.abc',
  '.usd',
  '.usda',
  '.usdc',
  '.svg',
  '.pdf',
  '.obj',
  '.ply',
  '.stl',
  '.bvh',
  '.fbx',
  '.glb',
  '.gltf',
] as const;

export type SupportedExtension =
  (typeof SUPPORTED_EXTENSIONS)[number];

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');

  if (lastDot < 0) {
    return '';
  }

  return filename.slice(lastDot).toLowerCase();
}

export function isSupportedExtension(
  extension: string,
): extension is SupportedExtension {
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(
    extension.toLowerCase(),
  );
}

export function assertSupportedExtension(filename: string): SupportedExtension {
  const extension = getFileExtension(filename);

  if (!isSupportedExtension(extension)) {
    throw new Error(
      `Unsupported file format. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`,
    );
  }

  return extension;
}
