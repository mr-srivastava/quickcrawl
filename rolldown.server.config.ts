import { defineConfig } from 'rolldown';

export default defineConfig({
  input: 'src/server.ts',
  external: (id) => /^[^./]/.test(id) || id === './index' || id === './index.js',
  platform: 'node',
  output: {
    dir: 'dist',
    format: 'esm',
    codeSplitting: false,
    sourcemap: true,
  },
});
