import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves project sites from /<repo>/, so the built asset
  // paths need that prefix. HashRouter (see src/App.tsx) means the routes
  // themselves don't care about the base path — only the JS/CSS <script>
  // and <link> tags in index.html do.
  base: process.env.GH_PAGES ? '/claude-code-/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
