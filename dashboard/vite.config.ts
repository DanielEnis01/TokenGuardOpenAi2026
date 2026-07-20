import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Required for Electron: assets must use relative paths when loaded via file://
  base: './',
  // Keep Electron's terminal output visible when running in dev mode
  clearScreen: false,
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used - do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
      'firebase/app': path.resolve(__dirname, './node_modules/firebase/app'),
      'firebase/auth': path.resolve(__dirname, './node_modules/firebase/auth'),
      'firebase/firestore': path.resolve(__dirname, './node_modules/firebase/firestore'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
