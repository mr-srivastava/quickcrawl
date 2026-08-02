import { defineConfig } from 'rolldown';

export default defineConfig({
  input: {
    index: 'src/index.ts',
    server: 'src/server.ts',
  },
  external: /^[^./]/,
  platform: 'node',
  output: {
    cleanDir: true,
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
  },
});
