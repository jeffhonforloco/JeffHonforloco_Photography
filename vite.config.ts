import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ isSsrBuild }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  ssr: {
    noExternal: ['react-helmet-async'],
  },
  build: {
    rollupOptions: {
      output: isSsrBuild ? {} : {
        manualChunks: {
          // Core React — always needed, cache-stable
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Forms + validation — only loaded on form pages
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Admin-only heavy deps — never on public pages
          admin: ['crypto-js', 'recharts'],
        },
      },
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
}));
