import { resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  publicDir: false,
  plugins: [svelte()],
  resolve: {
    alias: {
      $contracts: resolve('src/contracts'),
      $playground: resolve('src/ui/islands/playground'),
    },
    conditions: ['browser'],
  },
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve('src/ui/islands/playground/entry.ts'),
      formats: ['es'],
      fileName: () => 'playground.js',
    },
    outDir: 'public/assets',
    sourcemap: true,
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/test/setup-dom.ts'],
  },
});
