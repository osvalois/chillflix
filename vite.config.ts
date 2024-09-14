import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Añadir alias para dependencias si es necesario
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['blurhash'], // Aseguramos que Vite incluya blurhash al optimizar las dependencias
    esbuildOptions: {
      external: ['blurhash'], // Evitamos que intente agrupar este paquete
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly', // Configuración CSS en módulos
    },
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/], // Asegura que se procesen las dependencias en formato CommonJS
    },
  },
})
