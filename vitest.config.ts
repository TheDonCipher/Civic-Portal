/**
 * Vitest Configuration for Civic Portal
 * Comprehensive testing setup with React Testing Library integration
 */

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',
    
    // Global test setup
    setupFiles: ['./src/test/setup.ts'],
    
    // Include patterns
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'e2e/**'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.d.ts',
        'src/**/*.stories.{js,jsx,ts,tsx}',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'dist/',
        'coverage/',
        '**/*.config.{js,ts}',
        'src/lib/demoData.ts',
        'src/stories/**',
        'src/utils/seedData.ts',
        'src/utils/testDatabase.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    
    // Test timeout
    testTimeout: 10000,
    
    // Globals
    globals: true,
    
    // Mock configuration
    deps: {
      inline: ['@testing-library/user-event']
    },
    
    // Reporter configuration
    reporter: ['verbose', 'json', 'html'],
    
    // Watch configuration
    watch: false,
    
    // Parallel execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    }
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/providers': path.resolve(__dirname, './src/providers'),
      '@/test': path.resolve(__dirname, './src/test')
    }
  },
  
  // Define configuration for different environments
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('http://localhost:54321'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('test-key'),
    'import.meta.env.MODE': JSON.stringify('test'),
    'import.meta.env.DEV': false,
    'import.meta.env.PROD': false,
    'import.meta.env.SSR': false
  }
});
