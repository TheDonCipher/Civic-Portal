import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // ✅ Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-toast',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch'
          ],
          'supabase-vendor': ['@supabase/supabase-js'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'date-fns'],
          'animation-vendor': ['framer-motion'],

          // ✅ Feature-based chunks (only existing components)
          'admin-features': [
            './src/components/admin/AdminPage'
          ],
          'stakeholder-features': [
            './src/components/stakeholder/StakeholderDashboard'
          ],
          // ✅ Performance optimization chunks
          'performance-vendor': [
            './src/hooks/usePerformanceMonitor',
            './src/hooks/useOptimizedSubscription',
            './src/lib/utils/performanceMonitor'
          ]
        },
      },
    },
    // ✅ Optimize chunk size and enable source maps for debugging
    chunkSizeWarningLimit: 500,
    sourcemap: process.env.NODE_ENV === 'development',
    // ✅ Enable minification and compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
      },
    },
    // ✅ Optimize asset handling
    assetsInlineLimit: 4096, // 4kb
    cssCodeSplit: true,
  },
  // ✅ Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'clsx',
      'tailwind-merge'
    ],
    exclude: ['@testing-library/react']
  },
  // ✅ Enable CSS optimization
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  // ✅ Performance optimizations
  esbuild: {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  // ✅ Preview server configuration
  preview: {
    port: 4173,
    host: true,
  }
});
