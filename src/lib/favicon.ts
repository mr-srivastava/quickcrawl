import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const FAVICON_PATH = join(process.cwd(), 'public', 'favicon.ico');

let cachedFavicon: Uint8Array<ArrayBuffer> | null = null;

/** Read the ICO favicon (cached after first read). */
export async function getFaviconIco(): Promise<Uint8Array<ArrayBuffer>> {
  if (cachedFavicon != null) return cachedFavicon;
  cachedFavicon = Uint8Array.from(await readFile(FAVICON_PATH));
  return cachedFavicon;
}
