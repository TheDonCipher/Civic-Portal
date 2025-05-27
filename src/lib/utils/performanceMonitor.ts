/**
 * @fileoverview Performance Monitoring Utilities
 * @description Comprehensive performance monitoring and optimization tools
 * for the Civic Portal application including Core Web Vitals tracking,
 * bundle analysis, and runtime performance metrics.
 * 
 * @author Civic Portal Team
 * @version 1.0.0
 * @since 2024-01-01
 * 
 * @example Basic Usage
 * ```typescript
 * import { performanceMonitor } from '@/lib/utils/performanceMonitor';
 * 
 * // Start monitoring
 * performanceMonitor.init();
 * 
 * // Track custom metrics
 * performanceMonitor.trackCustomMetric('issue-load-time', 1250);
 * 
 * // Get performance report
 * const report = performanceMonitor.getReport();
 * ```
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'core-web-vital' | 'custom' | 'navigation' | 'resource';
}

interface PerformanceReport {
  coreWebVitals: {
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    fcp?: number; // First Contentful Paint
    ttfb?: number; // Time to First Byte
  };
  navigation: {
    domContentLoaded?: number;
    loadComplete?: number;
    timeToInteractive?: number;
  };
  resources: {
    totalSize: number;
    jsSize: number;
    cssSize: number;
    imageSize: number;
    fontSize: number;
  };
  customMetrics: Record<string, number>;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observer?: PerformanceObserver;
  private isInitialized = false;

  /**
   * Initialize performance monitoring
   */
  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    this.isInitialized = true;

    // Monitor Core Web Vitals
    this.initCoreWebVitals();

    // Monitor navigation timing
    this.initNavigationTiming();

    // Monitor resource loading
    this.initResourceTiming();

    // Monitor memory usage (if available)
    this.initMemoryMonitoring();

    // Log initial report
    setTimeout(() => {
      this.logReport();
    }, 5000);
  }

  /**
   * Initialize Core Web Vitals monitoring
   */
  private initCoreWebVitals(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entry: any) => {
      this.addMetric('lcp', entry.startTime, 'core-web-vital');
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entry: any) => {
      this.addMetric('fid', entry.processingStart - entry.startTime, 'core-web-vital');
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entry: any) => {
      if (!entry.hadRecentInput) {
        this.addMetric('cls', entry.value, 'core-web-vital');
      }
    });

    // First Contentful Paint (FCP)
    this.observeMetric('paint', (entry: any) => {
      if (entry.name === 'first-contentful-paint') {
        this.addMetric('fcp', entry.startTime, 'core-web-vital');
      }
    });
  }

  /**
   * Initialize navigation timing monitoring
   */
  private initNavigationTiming(): void {
    if (!('performance' in window) || !performance.timing) {
      return;
    }

    window.addEventListener('load', () => {
      const timing = performance.timing;
      const navigation = performance.navigation;

      // DOM Content Loaded
      const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      this.addMetric('domContentLoaded', domContentLoaded, 'navigation');

      // Load Complete
      const loadComplete = timing.loadEventEnd - timing.navigationStart;
      this.addMetric('loadComplete', loadComplete, 'navigation');

      // Time to First Byte
      const ttfb = timing.responseStart - timing.navigationStart;
      this.addMetric('ttfb', ttfb, 'core-web-vital');

      // Log navigation type
      console.log('Navigation type:', navigation.type === 0 ? 'navigate' : 
                  navigation.type === 1 ? 'reload' : 'back_forward');
    });
  }

  /**
   * Initialize resource timing monitoring
   */
  private initResourceTiming(): void {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    this.observeMetric('resource', (entry: any) => {
      const size = entry.transferSize || entry.encodedBodySize || 0;
      const type = this.getResourceType(entry.name);
      
      this.addMetric(`${type}Size`, size, 'resource');
    });
  }

  /**
   * Initialize memory monitoring
   */
  private initMemoryMonitoring(): void {
    if (!('memory' in performance)) {
      return;
    }

    // Monitor memory usage every 30 seconds
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        this.addMetric('usedJSHeapSize', memory.usedJSHeapSize, 'custom');
        this.addMetric('totalJSHeapSize', memory.totalJSHeapSize, 'custom');
        this.addMetric('jsHeapSizeLimit', memory.jsHeapSizeLimit, 'custom');
      }
    }, 30000);
  }

  /**
   * Observe specific performance metrics
   */
  private observeMetric(type: string, callback: (entry: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ entryTypes: [type] });
    } catch (error) {
      console.warn(`Failed to observe ${type} metrics:`, error);
    }
  }

  /**
   * Add a performance metric
   */
  private addMetric(name: string, value: number, type: PerformanceMetric['type']): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      type,
    });

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Track custom performance metric
   */
  trackCustomMetric(name: string, value: number): void {
    this.addMetric(name, value, 'custom');
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, renderTime: number): void {
    this.addMetric(`component-${componentName}`, renderTime, 'custom');
  }

  /**
   * Track API call performance
   */
  trackApiCall(endpoint: string, duration: number, success: boolean): void {
    this.addMetric(`api-${endpoint}-duration`, duration, 'custom');
    this.addMetric(`api-${endpoint}-success`, success ? 1 : 0, 'custom');
  }

  /**
   * Get resource type from URL
   */
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'js';
    if (url.includes('.css')) return 'css';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    return 'other';
  }

  /**
   * Get latest metric value by name
   */
  private getLatestMetric(name: string): number | undefined {
    const metric = this.metrics
      .filter(m => m.name === name)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    return metric?.value;
  }

  /**
   * Get aggregated resource sizes
   */
  private getResourceSizes(): PerformanceReport['resources'] {
    const sizes = {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      imageSize: 0,
      fontSize: 0,
    };

    this.metrics
      .filter(m => m.type === 'resource')
      .forEach(metric => {
        if (metric.name.endsWith('Size')) {
          const type = metric.name.replace('Size', '') as keyof typeof sizes;
          if (type in sizes) {
            sizes[type] += metric.value;
          }
          sizes.totalSize += metric.value;
        }
      });

    return sizes;
  }

  /**
   * Generate comprehensive performance report
   */
  getReport(): PerformanceReport {
    const coreWebVitals = {
      lcp: this.getLatestMetric('lcp'),
      fid: this.getLatestMetric('fid'),
      cls: this.getLatestMetric('cls'),
      fcp: this.getLatestMetric('fcp'),
      ttfb: this.getLatestMetric('ttfb'),
    };

    const navigation = {
      domContentLoaded: this.getLatestMetric('domContentLoaded'),
      loadComplete: this.getLatestMetric('loadComplete'),
      timeToInteractive: this.getLatestMetric('timeToInteractive'),
    };

    const resources = this.getResourceSizes();

    const customMetrics: Record<string, number> = {};
    this.metrics
      .filter(m => m.type === 'custom')
      .forEach(metric => {
        customMetrics[metric.name] = metric.value;
      });

    const memoryUsage = ('memory' in performance) ? {
      usedJSHeapSize: this.getLatestMetric('usedJSHeapSize') || 0,
      totalJSHeapSize: this.getLatestMetric('totalJSHeapSize') || 0,
      jsHeapSizeLimit: this.getLatestMetric('jsHeapSizeLimit') || 0,
    } : undefined;

    return {
      coreWebVitals,
      navigation,
      resources,
      customMetrics,
      memoryUsage,
    };
  }

  /**
   * Log performance report to console
   */
  logReport(): void {
    const report = this.getReport();
    
    console.group('🚀 Performance Report');
    console.log('Core Web Vitals:', report.coreWebVitals);
    console.log('Navigation Timing:', report.navigation);
    console.log('Resource Sizes:', report.resources);
    console.log('Memory Usage:', report.memoryUsage);
    console.groupEnd();
  }

  /**
   * Get performance score based on Core Web Vitals
   */
  getPerformanceScore(): number {
    const { lcp, fid, cls } = this.getReport().coreWebVitals;
    
    let score = 100;
    
    // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (lcp) {
      if (lcp > 4000) score -= 30;
      else if (lcp > 2500) score -= 15;
    }
    
    // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (fid) {
      if (fid > 300) score -= 30;
      else if (fid > 100) score -= 15;
    }
    
    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (cls) {
      if (cls > 0.25) score -= 30;
      else if (cls > 0.1) score -= 15;
    }
    
    return Math.max(0, score);
  }

  /**
   * Clean up performance monitoring
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.metrics = [];
    this.isInitialized = false;
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  performanceMonitor.init();
}
