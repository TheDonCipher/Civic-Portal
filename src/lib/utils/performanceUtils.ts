/**
 * Performance optimization utilities for the issue tracking system
 */

// Simple in-memory cache implementation
const cache = new Map<string, { data: any; expiry: number }>();

// Cache data with expiration
export const cacheData = (key: string, data: any, ttlSeconds = 300) => {
  if (!key || data === undefined) {
    console.warn("Invalid cache parameters", { key, data });
    return;
  }
  const expiry = Date.now() + ttlSeconds * 1000;
  cache.set(key, { data, expiry });
};

// Get data from cache if available and not expired
export const getCachedData = (key: string) => {
  if (!key) {
    console.warn("Invalid cache key", { key });
    return null;
  }

  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

// Clear cache for a specific key or pattern
export const clearCache = (keyPattern?: string) => {
  if (!keyPattern) {
    cache.clear();
    return;
  }

  // Clear keys matching the pattern
  for (const key of cache.keys()) {
    if (key.includes(keyPattern)) {
      cache.delete(key);
    }
  }
};

// Invalidate cache entries by pattern and return count
export const invalidateCachePattern = (pattern: string): number => {
  if (!pattern) {
    console.warn("Invalid cache pattern", pattern);
    return 0;
  }

  const keysToDelete: string[] = [];
  cache.forEach((_, key) => {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => {
    cache.delete(key);
    console.log(`Cache invalidated: ${key}`);
  });

  return keysToDelete.length;
};

// Invalidate specific user cache
export const invalidateUserCache = (userId: string): number => {
  if (!userId) {
    console.warn("Invalid user ID for cache invalidation", userId);
    return 0;
  }

  return invalidateCachePattern(`user_${userId}`);
};

// Debounce function to limit the rate of function calls
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number,
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }

    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        const result = func(...args);
        resolve(result);
      }, waitFor);
    });
  };
};

// Throttle function to ensure a function is not called more than once in a specified time period
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  limit: number,
) => {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<F>;

  return (...args: Parameters<F>): ReturnType<F> => {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func(...args);
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
};

// Lazy load images with Intersection Observer
export const setupLazyLoading = () => {
  if (!("IntersectionObserver" in window)) return;

  const lazyImages = document.querySelectorAll("img[data-src]");
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset['src'] || "";
        img.removeAttribute("data-src");
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach((img) => imageObserver.observe(img));
};

// Create pagination parameters for Supabase queries
export const getPaginationParams = (page = 1, pageSize = 10) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
};

// Measure and log performance of a function
export const measurePerformance = async <T>(
  fn: () => Promise<T>,
  label: string,
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.log(`Performance [${label}]: ${Math.round(end - start)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(
      `Performance [${label}] ERROR: ${Math.round(end - start)}ms`,
      error,
    );
    throw error;
  }
};

// ✅ Enhanced performance utilities for Phase 2

/**
 * Bundle size optimization utilities
 */
export const optimizeBundleSize = {
  // Preload critical resources
  preloadCriticalResources: () => {
    const criticalResources = [
      '/fonts/inter-400.woff2',
      '/fonts/inter-500.woff2',
      '/fonts/inter-600.woff2',
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.includes('.woff') ? 'font' : 'style';
      if (resource.includes('.woff')) {
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  },

  // Lazy load non-critical CSS
  loadNonCriticalCSS: (href: string) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);
  },
};

/**
 * Memory leak prevention utilities
 */
export const memoryLeakPrevention = {
  // Monitor memory usage
  monitorMemoryUsage: (threshold: number = 50) => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / (1024 * 1024);
        if (usedMB > threshold) {
          console.warn(`High memory usage detected: ${usedMB.toFixed(2)}MB`);
          // Trigger garbage collection if available
          if ('gc' in window) {
            (window as any).gc();
          }
        }
      }
    };

    return setInterval(checkMemory, 10000); // Check every 10 seconds
  },
};
