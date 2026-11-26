/**
 * Vite Configuration
 * 
 * TECHNOLOGY: Vite - Next-generation frontend build tool
 * WHY: Vite provides lightning-fast dev server and optimized production builds
 * - Hot Module Replacement (HMR) for instant feedback during development
 * - ES6 module-based development (no bundling during dev)
 * - Optimized production builds with code splitting and asset optimization
 * - 10-100x faster than Webpack for dev server startup
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Enables rapid development feedback loop for React UI
 * - Production build optimizes for performance and user experience
 * - React plugin enables JSX transformation
 * - API proxy configuration can be added for development
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
