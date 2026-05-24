import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — always needed, cache-stable
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Data fetching
          query: ['@tanstack/react-query'],
          // Forms + validation — only loaded on form pages
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Admin-only heavy deps — never on public pages
          admin: ['crypto-js', 'recharts'],
          // UI primitives — shared across pages
          ui: [
            'lucide-react',
            '@radix-ui/react-dialog',
            '@radix-ui/react-accordion',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-select',
            'next-themes',
            'sonner',
          ],
        },
      },
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,       // inline tiny assets < 4kb to save a request
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
}));
