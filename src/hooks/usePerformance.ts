/**
 * @fileoverview Performance Monitoring React Hook
 * @description React hook for monitoring component performance and tracking
 * render times, API calls, and user interactions.
 * 
 * @author Civic Portal Team
 * @version 1.0.0
 * @since 2024-01-01
 * 
 * @example Component Performance Tracking
 * ```typescript
 * import { usePerformance } from '@/hooks/usePerformance';
 * 
 * function MyComponent() {
 *   const { trackRender, trackApiCall } = usePerformance('MyComponent');
 *   
 *   useEffect(() => {
 *     trackRender();
 *   }, []);
 *   
 *   const handleApiCall = async () => {
 *     const { success, duration } = await trackApiCall('fetchIssues', fetchIssues);
 *     console.log(`API call took ${duration}ms, success: ${success}`);
 *   };
 *   
 *   return <div>Component content</div>;
 * }
 * ```
 */

import { useCallback, useEffect, useRef } from 'react';
import { performanceMonitor } from '@/lib/utils/performanceMonitor';

interface UsePerformanceReturn {
  /**
   * Track component render time
   */
  trackRender: () => void;
  
  /**
   * Track API call performance
   */
  trackApiCall: <T>(
    name: string, 
    apiCall: () => Promise<T>
  ) => Promise<{ result: T; duration: number; success: boolean }>;
  
  /**
   * Track user interaction
   */
  trackInteraction: (interactionName: string) => void;
  
  /**
   * Track custom metric
   */
  trackCustomMetric: (metricName: string, value: number) => void;
  
  /**
   * Start timing an operation
   */
  startTiming: (operationName: string) => () => void;
}

/**
 * Hook for performance monitoring and tracking
 * 
 * @param componentName - Name of the component for tracking
 * @returns Performance tracking utilities
 */
export function usePerformance(componentName?: string): UsePerformanceReturn {
  const renderStartTime = useRef<number>(Date.now());
  const timingOperations = useRef<Map<string, number>>(new Map());

  // Track initial render time
  useEffect(() => {
    if (componentName) {
      const renderTime = Date.now() - renderStartTime.current;
      performanceMonitor.trackComponentRender(componentName, renderTime);
    }
  }, [componentName]);

  /**
   * Track component render time manually
   */
  const trackRender = useCallback(() => {
    if (componentName) {
      const renderTime = Date.now() - renderStartTime.current;
      performanceMonitor.trackComponentRender(componentName, renderTime);
    }
  }, [componentName]);

  /**
   * Track API call performance with automatic timing
   */
  const trackApiCall = useCallback(async <T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<{ result: T; duration: number; success: boolean }> => {
    const startTime = performance.now();
    let success = false;
    let result: T;

    try {
      result = await apiCall();
      success = true;
      return { result, duration: performance.now() - startTime, success };
    } catch (error) {
      throw error;
    } finally {
      const duration = performance.now() - startTime;
      performanceMonitor.trackApiCall(name, duration, success);
    }
  }, []);

  /**
   * Track user interactions
   */
  const trackInteraction = useCallback((interactionName: string) => {
    const fullName = componentName 
      ? `${componentName}-${interactionName}` 
      : interactionName;
    
    performanceMonitor.trackCustomMetric(`interaction-${fullName}`, Date.now());
  }, [componentName]);

  /**
   * Track custom metrics
   */
  const trackCustomMetric = useCallback((metricName: string, value: number) => {
    const fullName = componentName 
      ? `${componentName}-${metricName}` 
      : metricName;
    
    performanceMonitor.trackCustomMetric(fullName, value);
  }, [componentName]);

  /**
   * Start timing an operation and return a function to end timing
   */
  const startTiming = useCallback((operationName: string) => {
    const fullName = componentName 
      ? `${componentName}-${operationName}` 
      : operationName;
    
    const startTime = performance.now();
    timingOperations.current.set(fullName, startTime);

    return () => {
      const endTime = performance.now();
      const startTime = timingOperations.current.get(fullName);
      
      if (startTime !== undefined) {
        const duration = endTime - startTime;
        performanceMonitor.trackCustomMetric(`timing-${fullName}`, duration);
        timingOperations.current.delete(fullName);
      }
    };
  }, [componentName]);

  return {
    trackRender,
    trackApiCall,
    trackInteraction,
    trackCustomMetric,
    startTiming,
  };
}

/**
 * Hook for tracking page load performance
 */
export function usePagePerformance(pageName: string) {
  const pageLoadStart = useRef<number>(Date.now());

  useEffect(() => {
    // Track page load time
    const loadTime = Date.now() - pageLoadStart.current;
    performanceMonitor.trackCustomMetric(`page-load-${pageName}`, loadTime);

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performanceMonitor.trackCustomMetric(`page-visible-${pageName}`, Date.now());
      } else {
        performanceMonitor.trackCustomMetric(`page-hidden-${pageName}`, Date.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pageName]);

  return {
    trackPageInteraction: (interaction: string) => {
      performanceMonitor.trackCustomMetric(`page-${pageName}-${interaction}`, Date.now());
    },
  };
}

/**
 * Hook for tracking form performance
 */
export function useFormPerformance(formName: string) {
  const formStartTime = useRef<number>(Date.now());
  const fieldInteractions = useRef<Map<string, number>>(new Map());

  const trackFieldInteraction = useCallback((fieldName: string) => {
    const now = Date.now();
    const lastInteraction = fieldInteractions.current.get(fieldName);
    
    if (lastInteraction) {
      const timeBetweenInteractions = now - lastInteraction;
      performanceMonitor.trackCustomMetric(
        `form-${formName}-field-${fieldName}-interaction-gap`,
        timeBetweenInteractions
      );
    }
    
    fieldInteractions.current.set(fieldName, now);
    performanceMonitor.trackCustomMetric(
      `form-${formName}-field-${fieldName}-interaction`,
      now
    );
  }, [formName]);

  const trackFormSubmission = useCallback((success: boolean) => {
    const submissionTime = Date.now() - formStartTime.current;
    performanceMonitor.trackCustomMetric(
      `form-${formName}-submission-time`,
      submissionTime
    );
    performanceMonitor.trackCustomMetric(
      `form-${formName}-submission-success`,
      success ? 1 : 0
    );
  }, [formName]);

  const trackValidationError = useCallback((fieldName: string) => {
    performanceMonitor.trackCustomMetric(
      `form-${formName}-validation-error-${fieldName}`,
      Date.now()
    );
  }, [formName]);

  return {
    trackFieldInteraction,
    trackFormSubmission,
    trackValidationError,
  };
}

/**
 * Hook for tracking scroll performance
 */
export function useScrollPerformance(containerName: string) {
  const lastScrollTime = useRef<number>(0);
  const scrollCount = useRef<number>(0);

  const trackScroll = useCallback(() => {
    const now = Date.now();
    scrollCount.current++;
    
    if (now - lastScrollTime.current > 100) { // Throttle to every 100ms
      performanceMonitor.trackCustomMetric(
        `scroll-${containerName}-count`,
        scrollCount.current
      );
      lastScrollTime.current = now;
    }
  }, [containerName]);

  const trackScrollToBottom = useCallback(() => {
    performanceMonitor.trackCustomMetric(
      `scroll-${containerName}-to-bottom`,
      Date.now()
    );
  }, [containerName]);

  return {
    trackScroll,
    trackScrollToBottom,
  };
}
