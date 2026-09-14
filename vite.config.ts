import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ isSsrBuild, mode }) => ({
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
  plugins: [
    react(),
    ...(mode === 'admin' ? [{
      name: 'admin-private-entry-metadata',
      transformIndexHtml(html: string) {
        return html
          .replace(/<title>[^<]*<\/title>/i, '<title>Growth Command Center | Jeff Honforloco Photography</title>')
          .replace(/<meta name="description"[^>]*>/i, '<meta name="description" content="Private business operations dashboard." />')
          .replace(/<link rel="canonical"[^>]*>/i, '<meta name="robots" content="noindex, nofollow, noarchive" />')
          .replace(/\s*<link\s+rel="preload"\s+as="image"[\s\S]*?\/>/gi, '');
      },
    }] : []),
  ],
  resolve: {
    alias: [
      {
        find: '@/app-entry',
        replacement: path.resolve(
          __dirname,
          mode === 'admin' ? './src/admin-app-entry.tsx' : './src/app-entry.ts',
        ),
      },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
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
          // The private build owns admin-only dependencies. Keeping this entry
          // out of the public graph prevents an otherwise unused admin chunk.
          ...(mode === 'admin' ? { admin: ['crypto-js', 'recharts'] } : {}),
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
