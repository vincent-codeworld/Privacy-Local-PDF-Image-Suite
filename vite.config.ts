import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        merge: resolve(root, 'merge-pdf/index.html'),
        split: resolve(root, 'split-pdf/index.html'),
        compress: resolve(root, 'compress-pdf/index.html'),
        jpgToPdf: resolve(root, 'jpg-to-pdf/index.html'),
        pdfToJpg: resolve(root, 'pdf-to-jpg/index.html'),
        privacy: resolve(root, 'privacy/index.html'),
      },
    },
  },
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
})
