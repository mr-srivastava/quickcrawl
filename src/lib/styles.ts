import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const STYLES_PATH = join(process.cwd(), 'public', 'styles.css');

let cachedCss: string | null = null;

/** Read compiled Tailwind CSS (cached after first read). */
export async function getStylesCss(): Promise<string> {
  if (cachedCss != null) return cachedCss;
  cachedCss = await readFile(STYLES_PATH, 'utf-8');
  return cachedCss;
}

/** Clear cache (e.g. after CSS rebuild in dev). */
export function clearStylesCache(): void {
  cachedCss = null;
}
