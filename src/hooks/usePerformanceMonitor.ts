/**
 * @fileoverview Performance Monitoring Hook
 * @description Provides real-time performance monitoring and memory leak detection
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  subscriptionCount: number;
  eventListenerCount: number;
}

interface PerformanceAlert {
  type: 'memory' | 'render' | 'subscription' | 'listener';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: number;
  value?: number;
  threshold?: number;
}

const MEMORY_THRESHOLD_MB = 50; // Alert if memory usage exceeds 50MB
const RENDER_TIME_THRESHOLD_MS = 16; // Alert if render takes longer than 16ms (60fps)
const SUBSCRIPTION_THRESHOLD = 10; // Alert if more than 10 active subscriptions

/**
 * Hook for monitoring component performance and detecting potential issues
 */
export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: null,
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    subscriptionCount: 0,
    eventListenerCount: 0,
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const renderTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const listenersRef = useRef<Set<string>>(new Set());

  // Track render start time
  const trackRenderStart = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  // Track render end time and calculate metrics
  const trackRenderEnd = useCallback(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    renderTimesRef.current.push(renderTime);
    
    // Keep only last 100 render times for average calculation
    if (renderTimesRef.current.length > 100) {
      renderTimesRef.current.shift();
    }

    const averageRenderTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;

    setMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1,
      lastRenderTime: renderTime,
      averageRenderTime,
    }));

    // Check for slow renders
    if (renderTime > RENDER_TIME_THRESHOLD_MS) {
      addAlert({
        type: 'render',
        severity: renderTime > RENDER_TIME_THRESHOLD_MS * 2 ? 'high' : 'medium',
        message: `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`,
        timestamp: Date.now(),
        value: renderTime,
        threshold: RENDER_TIME_THRESHOLD_MS,
      });
    }
  }, [componentName]);

  // Add performance alert
  const addAlert = useCallback((alert: PerformanceAlert) => {
    setAlerts(prev => {
      const newAlerts = [...prev, alert];
      // Keep only last 50 alerts
      return newAlerts.slice(-50);
    });
  }, []);

  // Track subscription registration
  const trackSubscription = useCallback((subscriptionId: string, action: 'add' | 'remove') => {
    if (action === 'add') {
      subscriptionsRef.current.add(subscriptionId);
    } else {
      subscriptionsRef.current.delete(subscriptionId);
    }

    const count = subscriptionsRef.current.size;
    setMetrics(prev => ({ ...prev, subscriptionCount: count }));

    // Check for too many subscriptions
    if (count > SUBSCRIPTION_THRESHOLD) {
      addAlert({
        type: 'subscription',
        severity: 'high',
        message: `High subscription count in ${componentName}: ${count} active subscriptions`,
        timestamp: Date.now(),
        value: count,
        threshold: SUBSCRIPTION_THRESHOLD,
      });
    }
  }, [componentName, addAlert]);

  // Track event listener registration
  const trackEventListener = useCallback((listenerId: string, action: 'add' | 'remove') => {
    if (action === 'add') {
      listenersRef.current.add(listenerId);
    } else {
      listenersRef.current.delete(listenerId);
    }

    const count = listenersRef.current.size;
    setMetrics(prev => ({ ...prev, eventListenerCount: count }));
  }, []);

  // Monitor memory usage
  useEffect(() => {
    const checkMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };

        setMetrics(prev => ({ ...prev, memoryUsage }));

        // Check for high memory usage
        const usedMB = memory.usedJSHeapSize / (1024 * 1024);
        if (usedMB > MEMORY_THRESHOLD_MB) {
          addAlert({
            type: 'memory',
            severity: usedMB > MEMORY_THRESHOLD_MB * 2 ? 'high' : 'medium',
            message: `High memory usage in ${componentName}: ${usedMB.toFixed(2)}MB`,
            timestamp: Date.now(),
            value: usedMB,
            threshold: MEMORY_THRESHOLD_MB,
          });
        }
      }
    };

    // Check memory usage every 5 seconds
    const interval = setInterval(checkMemoryUsage, 5000);
    checkMemoryUsage(); // Initial check

    return () => clearInterval(interval);
  }, [componentName, addAlert]);

  // Track component renders
  useEffect(() => {
    trackRenderStart();
    return trackRenderEnd;
  });

  // Cleanup tracking on unmount
  useEffect(() => {
    return () => {
      // Clear all tracked subscriptions and listeners
      subscriptionsRef.current.clear();
      listenersRef.current.clear();
    };
  }, []);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const recentAlerts = alerts.filter(alert => Date.now() - alert.timestamp < 60000); // Last minute
    const highSeverityAlerts = recentAlerts.filter(alert => alert.severity === 'high');

    return {
      status: highSeverityAlerts.length > 0 ? 'critical' : 
              recentAlerts.length > 5 ? 'warning' : 'good',
      metrics,
      recentAlerts,
      recommendations: generateRecommendations(metrics, recentAlerts),
    };
  }, [metrics, alerts]);

  return {
    metrics,
    alerts,
    trackSubscription,
    trackEventListener,
    trackRenderStart,
    trackRenderEnd,
    getPerformanceSummary,
    clearAlerts: () => setAlerts([]),
  };
}

/**
 * Generate performance recommendations based on metrics and alerts
 */
function generateRecommendations(
  metrics: PerformanceMetrics,
  alerts: PerformanceAlert[]
): string[] {
  const recommendations: string[] = [];

  // Memory recommendations
  if (metrics.memoryUsage && metrics.memoryUsage.usedJSHeapSize > MEMORY_THRESHOLD_MB * 1024 * 1024) {
    recommendations.push('Consider implementing React.memo for expensive components');
    recommendations.push('Check for memory leaks in event listeners and subscriptions');
  }

  // Render performance recommendations
  if (metrics.averageRenderTime > RENDER_TIME_THRESHOLD_MS) {
    recommendations.push('Optimize component rendering with useMemo and useCallback');
    recommendations.push('Consider code splitting for large components');
  }

  // Subscription recommendations
  if (metrics.subscriptionCount > SUBSCRIPTION_THRESHOLD) {
    recommendations.push('Reduce the number of active subscriptions');
    recommendations.push('Consider batching subscription updates');
  }

  // Alert-based recommendations
  const memoryAlerts = alerts.filter(alert => alert.type === 'memory');
  if (memoryAlerts.length > 3) {
    recommendations.push('Investigate potential memory leaks');
  }

  const renderAlerts = alerts.filter(alert => alert.type === 'render');
  if (renderAlerts.length > 5) {
    recommendations.push('Profile component rendering performance');
  }

  return recommendations;
}

export default usePerformanceMonitor;
