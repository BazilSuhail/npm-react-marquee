import { defineConfig } from 'tsup';
import { copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    if (format === 'esm') return { js: '.js' };
    return { js: '.cjs' };
  },
  onSuccess() {
    copyFileSync(join(__dirname, 'src', 'styles.css'), join(__dirname, 'dist', 'styles.css'));
  },
});
