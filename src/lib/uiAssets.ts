import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ASSETS_DIR = join(process.cwd(), 'public', 'assets');

const FILENAME_PATTERN = /^[\w.-]+\.(js|map)$/;

const assetCache = new Map<string, string>();

export function isValidAssetFilename(filename: string): boolean {
  return FILENAME_PATTERN.test(filename);
}

export async function getUiAsset(
  filename: string,
): Promise<string | undefined> {
  if (!isValidAssetFilename(filename)) return undefined;

  if (process.env.NODE_ENV !== 'development') {
    const cached = assetCache.get(filename);
    if (cached !== undefined) return cached;
  }

  try {
    const content = await readFile(join(ASSETS_DIR, filename), 'utf-8');
    if (process.env.NODE_ENV !== 'development') {
      assetCache.set(filename, content);
    }
    return content;
  } catch {
    return undefined;
  }
}

export function clearUiAssetsCache(): void {
  assetCache.clear();
}
