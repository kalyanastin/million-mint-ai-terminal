import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    host: true
  },
  // Avoid esbuild binary spawning for minification by using term EPERM bypass
  esbuild: {
    minifyIdentifiers: false,
    minifySyntax: false,
    minifyWhitespace: false
  }
});
