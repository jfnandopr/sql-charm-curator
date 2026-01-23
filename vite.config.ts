import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
    // Optimize build output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    // Enable source maps for better production debugging and Lighthouse insights
    sourcemap: true,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Increase chunk size warning limit (we're handling large chunks intentionally)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],
          'icons': ['lucide-react'],
          'formatter': ['sql-formatter'],
          'ui': ['@radix-ui/react-accordion', '@radix-ui/react-label', '@radix-ui/react-select', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          // Syntax highlighter is now lazy loaded, so it will be in a separate chunk automatically
        },
        // Optimize chunk file names for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
}));

