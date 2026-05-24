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
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-accordion', '@radix-ui/react-tabs'],
          query: ['@tanstack/react-query'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          crypto: ['crypto-js'],
          carousel: ['embla-carousel-react'],
          theme: ['next-themes'],
        }
      }
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets - reduce inline threshold for better caching
    assetsInlineLimit: 1024, // Reduced for better caching
    // Disable source maps for production to reduce bundle size
    sourcemap: false,
    // Minimize bundle size with esbuild (default, no extra dependencies)
    minify: 'esbuild',
    // Target modern browsers for better performance
    target: 'es2020', // Updated for better performance
    // Enable tree shaking
    treeshake: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'lucide-react']
  }
}));
