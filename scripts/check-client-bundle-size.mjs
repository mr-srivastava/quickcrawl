import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const bundlePath = new URL('../public/assets/playground.js', import.meta.url);
const maximumGzipBytes = 15 * 1024;

const bundle = await readFile(bundlePath);
const gzipBytes = gzipSync(bundle).byteLength;

if (gzipBytes > maximumGzipBytes) {
  throw new Error(
    `Initial playground bundle is ${(gzipBytes / 1024).toFixed(2)} KiB gzip; ` +
      `the limit is ${maximumGzipBytes / 1024} KiB.`,
  );
}

process.stdout.write(
  `Initial playground bundle: ${(gzipBytes / 1024).toFixed(2)} KiB gzip ` +
    `(limit: ${maximumGzipBytes / 1024} KiB).\n`,
);
