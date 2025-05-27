/**
 * @fileoverview Lazy-loaded Chart Components
 * @description Implements lazy loading for chart components to reduce initial bundle size
 */

import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load chart components to reduce initial bundle size
const TrendChart = lazy(() => import('@/components/reports/TrendChart'));
const StatCards = lazy(() => import('@/components/reports/StatCards'));
const PerformanceChart = lazy(() => import('@/components/reports/PerformanceChart'));

// Chart loading skeleton
const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-48" />
    <Skeleton className={`h-${height} w-full rounded-lg`} />
    <div className="flex space-x-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);

// Stat cards loading skeleton
const StatCardsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="p-6 border rounded-lg space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    ))}
  </div>
);

// Lazy-loaded TrendChart with error boundary
export const LazyTrendChart = React.memo((props: any) => (
  <Suspense fallback={<ChartSkeleton height={400} />}>
    <TrendChart {...props} />
  </Suspense>
));

// Lazy-loaded StatCards with error boundary
export const LazyStatCards = React.memo((props: any) => (
  <Suspense fallback={<StatCardsSkeleton />}>
    <StatCards {...props} />
  </Suspense>
));

// Lazy-loaded PerformanceChart with error boundary
export const LazyPerformanceChart = React.memo((props: any) => (
  <Suspense fallback={<ChartSkeleton height={350} />}>
    <PerformanceChart {...props} />
  </Suspense>
));

// Chart error boundary component
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-red-800 font-medium">Chart Loading Error</h3>
          <p className="text-red-600 text-sm mt-1">
            Unable to load chart component. Please refresh the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component with error boundary
export const SafeLazyChart = ({ 
  component: Component, 
  fallback, 
  errorFallback,
  ...props 
}: {
  component: React.ComponentType<any>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  [key: string]: any;
}) => (
  <ChartErrorBoundary fallback={errorFallback}>
    <Suspense fallback={fallback || <ChartSkeleton />}>
      <Component {...props} />
    </Suspense>
  </ChartErrorBoundary>
);

// Preload chart components when user hovers over navigation
export const preloadChartComponents = () => {
  // Preload components in the background
  import('@/components/reports/TrendChart');
  import('@/components/reports/StatCards');
  import('@/components/reports/PerformanceChart');
};

// Hook for managing chart component loading
export const useChartPreloader = () => {
  const [isPreloaded, setIsPreloaded] = React.useState(false);

  const preload = React.useCallback(() => {
    if (!isPreloaded) {
      preloadChartComponents();
      setIsPreloaded(true);
    }
  }, [isPreloaded]);

  return { preload, isPreloaded };
};

export default {
  LazyTrendChart,
  LazyStatCards,
  LazyPerformanceChart,
  SafeLazyChart,
  preloadChartComponents,
  useChartPreloader,
};
