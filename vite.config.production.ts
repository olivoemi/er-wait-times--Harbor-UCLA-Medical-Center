import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// Production configuration for GitHub Pages deployment
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  base: '/er-wait-times--Harbor-UCLA-Medical-Center/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Remove `minify: 'terser'` so Vite uses the default (esbuild), which requires no extra deps
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-dialog']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    // Safe stubs so the public build never crashes if referenced
    GITHUB_RUNTIME_PERMANENT_NAME: JSON.stringify(''),
    BASE_KV_SERVICE_URL: JSON.stringify(''),
  }
});
