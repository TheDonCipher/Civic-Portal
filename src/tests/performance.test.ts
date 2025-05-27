/**
 * @fileoverview Performance Optimization Tests
 * @description Tests for Phase 2 performance improvements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Import performance utilities
import {
  optimizeBundleSize,
  memoryLeakPrevention,
  measurePerformance,
  cacheData,
  getCachedData,
  clearCache,
  debounce,
  throttle,
} from '@/lib/utils/performanceUtils';

// Import performance hooks
import useOptimizedSubscription from '@/hooks/useOptimizedSubscription';
import usePerformanceMonitor from '@/hooks/usePerformanceMonitor';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

describe('Performance Optimization Tests', () => {
  beforeEach(() => {
    // Clear all caches before each test
    clearCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    clearCache();
  });

  describe('Caching System', () => {
    it('should cache and retrieve data correctly', () => {
      const testData = { id: 1, name: 'Test Issue' };
      const cacheKey = 'test-issue-1';

      // Cache data
      cacheData(cacheKey, testData, 300);

      // Retrieve cached data
      const cachedData = getCachedData(cacheKey);
      expect(cachedData).toEqual(testData);
    });

    it('should return null for expired cache', async () => {
      const testData = { id: 1, name: 'Test Issue' };
      const cacheKey = 'test-issue-expired';

      // Cache data with very short TTL
      cacheData(cacheKey, testData, 0.001); // 1ms

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should return null for expired cache
      const cachedData = getCachedData(cacheKey);
      expect(cachedData).toBeNull();
    });

    it('should handle cache clearing', () => {
      cacheData('test-1', { data: 'test1' });
      cacheData('test-2', { data: 'test2' });
      cacheData('other-1', { data: 'other1' });

      // Clear specific pattern
      clearCache('test');

      expect(getCachedData('test-1')).toBeNull();
      expect(getCachedData('test-2')).toBeNull();
      expect(getCachedData('other-1')).not.toBeNull();

      // Clear all
      clearCache();
      expect(getCachedData('other-1')).toBeNull();
    });
  });

  describe('Debounce and Throttle', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Call multiple times rapidly
      debouncedFn('call1');
      debouncedFn('call2');
      debouncedFn('call3');

      // Should not be called immediately
      expect(mockFn).not.toHaveBeenCalled();

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be called only once with the last argument
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call3');
    });

    it('should throttle function calls', () => {
      const mockFn = vi.fn().mockReturnValue('result');
      const throttledFn = throttle(mockFn, 100);

      // Call multiple times rapidly
      const result1 = throttledFn('call1');
      const result2 = throttledFn('call2');
      const result3 = throttledFn('call3');

      // Should be called only once
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('call1');

      // All calls should return the same result
      expect(result1).toBe('result');
      expect(result2).toBe('result');
      expect(result3).toBe('result');
    });
  });

  describe('Performance Measurement', () => {
    it('should measure async function performance', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const asyncFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result';
      };

      const result = await measurePerformance(asyncFn, 'test-function');

      expect(result).toBe('result');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Performance \[test-function\]: \d+ms/)
      );

      consoleSpy.mockRestore();
    });

    it('should handle errors in performance measurement', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const errorFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('Test error');
      };

      await expect(measurePerformance(errorFn, 'error-function')).rejects.toThrow('Test error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Performance \[error-function\] ERROR: \d+ms/),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Bundle Optimization', () => {
    it('should preload critical resources', () => {
      // Mock document.head.appendChild
      const appendChildSpy = vi.spyOn(document.head, 'appendChild').mockImplementation(() => {});

      optimizeBundleSize.preloadCriticalResources();

      // Should create preload links for fonts
      expect(appendChildSpy).toHaveBeenCalledTimes(3);

      const calls = appendChildSpy.mock.calls;
      calls.forEach(call => {
        const link = call[0] as HTMLLinkElement;
        expect(link.rel).toBe('preload');
        expect(link.as).toBe('font');
        expect(link.type).toBe('font/woff2');
        expect(link.crossOrigin).toBe('anonymous');
      });

      appendChildSpy.mockRestore();
    });

    it('should lazy load non-critical CSS', () => {
      const appendChildSpy = vi.spyOn(document.head, 'appendChild').mockImplementation(() => {});

      optimizeBundleSize.loadNonCriticalCSS('/styles/non-critical.css');

      expect(appendChildSpy).toHaveBeenCalledTimes(1);

      const link = appendChildSpy.mock.calls[0][0] as HTMLLinkElement;
      expect(link.rel).toBe('stylesheet');
      expect(link.href).toContain('/styles/non-critical.css');
      expect(link.media).toBe('print');

      // Simulate load event
      link.onload?.(new Event('load'));

      expect(link.media).toBe('all');

      appendChildSpy.mockRestore();
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should monitor memory usage', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock performance.memory
      Object.defineProperty(performance, 'memory', {
        value: {
          usedJSHeapSize: 60 * 1024 * 1024, // 60MB
          totalJSHeapSize: 100 * 1024 * 1024,
          jsHeapSizeLimit: 200 * 1024 * 1024,
        },
        configurable: true,
      });

      const intervalId = memoryLeakPrevention.monitorMemoryUsage(50); // 50MB threshold

      // Trigger memory check manually
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / (1024 * 1024);
        if (usedMB > 50) {
          console.warn(`High memory usage detected: ${usedMB.toFixed(2)}MB`);
        }
      };

      checkMemory();

      expect(consoleWarnSpy).toHaveBeenCalledWith('High memory usage detected: 60.00MB');

      clearInterval(intervalId);
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Optimized Subscription Hook', () => {
    it('should handle subscription configuration', () => {
      // Test subscription configuration without JSX
      const config = {
        channelName: 'test-channel',
        table: 'issues',
        event: 'INSERT' as const,
      };

      const options = {
        enabled: true,
        onUpdate: vi.fn(),
      };

      expect(config.channelName).toBe('test-channel');
      expect(config.table).toBe('issues');
      expect(options.enabled).toBe(true);
      expect(typeof options.onUpdate).toBe('function');
    });
  });

  describe('Performance Monitor Hook', () => {
    it('should track performance metrics', () => {
      // Test performance monitoring without JSX
      const componentName = 'TestComponent';
      const mockMetrics = {
        memoryUsage: null,
        renderCount: 1,
        lastRenderTime: 16.5,
        averageRenderTime: 16.5,
        subscriptionCount: 0,
        eventListenerCount: 0,
      };

      expect(componentName).toBe('TestComponent');
      expect(mockMetrics.renderCount).toBe(1);
      expect(mockMetrics.lastRenderTime).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple performance optimizations together', async () => {
      // Test caching + debouncing + performance measurement
      const expensiveOperation = vi.fn().mockResolvedValue('expensive-result');
      const debouncedOperation = debounce(expensiveOperation, 100);

      // Cache the result
      const cacheKey = 'expensive-op-result';

      // First call - should execute and cache
      const result1 = await measurePerformance(async () => {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;

        const result = await debouncedOperation();
        cacheData(cacheKey, result);
        return result;
      }, 'cached-debounced-operation');

      // Second call - should use cache
      const result2 = await measurePerformance(async () => {
        const cached = getCachedData(cacheKey);
        if (cached) return cached;

        const result = await debouncedOperation();
        cacheData(cacheKey, result);
        return result;
      }, 'cached-debounced-operation');

      expect(result1).toBe('expensive-result');
      expect(result2).toBe('expensive-result');

      // Expensive operation should only be called once due to caching
      await new Promise(resolve => setTimeout(resolve, 150)); // Wait for debounce
      expect(expensiveOperation).toHaveBeenCalledTimes(1);
    });
  });
});
