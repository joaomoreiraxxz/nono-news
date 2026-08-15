import { defineConfig } from 'vite';

export default defineConfig({
  // O Vite serve o front-end e faz proxy das chamadas /api para o Express
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // Em produção, gera o build na pasta dist/
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './admin.html',
      },
    },
  },
});
