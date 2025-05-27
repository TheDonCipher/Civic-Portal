/**
 * @fileoverview Vite Bundle Analyzer Configuration
 * @description Configuration for analyzing bundle size and optimizing build output.
 * This configuration enables detailed bundle analysis to identify optimization opportunities.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer plugin
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // 'treemap', 'sunburst', 'network'
    }),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    // Generate source maps for analysis
    sourcemap: true,
    
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          'date-vendor': ['date-fns'],
          'chart-vendor': ['recharts'],
          
          // Feature chunks
          'auth': ['src/lib/auth.ts', 'src/providers/AuthProvider.tsx'],
          'sanitization': ['src/lib/sanitization.ts'],
          'accessibility': ['src/lib/utils/accessibilityUtils.ts'],
        },
      },
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
    ],
    exclude: [
      // Exclude large dependencies that should be loaded on demand
    ],
  },
});
