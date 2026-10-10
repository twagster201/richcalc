import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'node:path';

const pages = ['index.html', 'mortgage-or-isa/index.html', 'how-it-works/index.html', 'assumptions/index.html', 'sources/index.html', 'about/index.html'];

export default defineConfig({
  plugins: [preact()],
  build: {
    target: 'es2022',
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p.replace(/\/?index\.html$/, '') || 'home', resolve(import.meta.dirname, p)])),
    },
  },
  worker: { format: 'es' },
});
