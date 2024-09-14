import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url'; // Importación necesaria

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // Usar `fileURLToPath` y `URL`
    },
  },
  optimizeDeps: {
    include: ['blurhash'],
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
