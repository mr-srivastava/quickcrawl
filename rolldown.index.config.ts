import { defineConfig } from 'rolldown';

export default defineConfig({
  input: 'src/index.ts',
  external: /^[^./]/,
  platform: 'node',
  output: {
    cleanDir: true,
    dir: 'dist',
    format: 'esm',
    codeSplitting: false,
    sourcemap: true,
  },
});
