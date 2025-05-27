/**
 * @fileoverview React Query Configuration
 * @description Comprehensive React Query setup with optimized caching strategies,
 * error handling, and performance optimizations for the Civic Portal.
 * 
 * @author Civic Portal Team
 * @version 1.0.0
 * @since 2024-01-01
 * 
 * @example Basic Usage
 * ```typescript
 * import { queryClient } from '@/lib/query/queryClient';
 * import { QueryClientProvider } from '@tanstack/react-query';
 * 
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <YourApp />
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { announceToScreenReader } from '@/lib/utils/accessibilityUtils';
import { handleApiError } from '@/lib/utils/errorHandler';

/**
 * Default query options for optimal performance and user experience
 */
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Cache time - how long data stays in cache when not being observed
    gcTime: 1000 * 60 * 5, // 5 minutes
    
    // Stale time - how long data is considered fresh
    staleTime: 1000 * 60 * 2, // 2 minutes
    
    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus for critical data
    refetchOnWindowFocus: true,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Background refetch interval (disabled by default)
    refetchInterval: false,
    
    // Error handling
    onError: (error: any) => {
      console.error('Query error:', error);
      handleApiError(error, 'QueryClient', 'query');
      
      // Announce errors to screen readers for accessibility
      announceToScreenReader(
        'An error occurred while loading data. Please try again.',
        'assertive'
      );
    },
  },
  
  mutations: {
    // Retry mutations once
    retry: 1,
    
    // Retry delay for mutations
    retryDelay: 1000,
    
    // Error handling for mutations
    onError: (error: any) => {
      console.error('Mutation error:', error);
      handleApiError(error, 'QueryClient', 'mutation');
      
      // Announce mutation errors to screen readers
      announceToScreenReader(
        'An error occurred while saving data. Please try again.',
        'assertive'
      );
    },
    
    // Success handling for mutations
    onSuccess: () => {
      // Announce successful mutations to screen readers
      announceToScreenReader(
        'Data saved successfully.',
        'polite'
      );
    },
  },
};

/**
 * Create and configure the React Query client
 */
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

/**
 * Query key factory for consistent cache key generation
 * Provides type-safe query keys and prevents cache key collisions
 */
export const queryKeys = {
  // Issues
  issues: {
    all: ['issues'] as const,
    lists: () => [...queryKeys.issues.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.issues.lists(), filters] as const,
    details: () => [...queryKeys.issues.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.issues.details(), id] as const,
    stats: () => [...queryKeys.issues.all, 'stats'] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => 
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: (id: string) => [...queryKeys.users.all, 'profile', id] as const,
    stats: (id: string) => [...queryKeys.users.all, 'stats', id] as const,
  },
  
  // Comments
  comments: {
    all: ['comments'] as const,
    lists: () => [...queryKeys.comments.all, 'list'] as const,
    byIssue: (issueId: string) => 
      [...queryKeys.comments.lists(), 'issue', issueId] as const,
  },
  
  // Solutions
  solutions: {
    all: ['solutions'] as const,
    lists: () => [...queryKeys.solutions.all, 'list'] as const,
    byIssue: (issueId: string) => 
      [...queryKeys.solutions.lists(), 'issue', issueId] as const,
  },
  
  // Departments
  departments: {
    all: ['departments'] as const,
    lists: () => [...queryKeys.departments.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.departments.all, 'detail', id] as const,
  },
  
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    citizenStats: () => [...queryKeys.dashboard.stats(), 'citizen'] as const,
    stakeholderStats: (departmentId?: string) => 
      [...queryKeys.dashboard.stats(), 'stakeholder', departmentId] as const,
    adminStats: () => [...queryKeys.dashboard.stats(), 'admin'] as const,
  },
} as const;

/**
 * Cache invalidation utilities
 * Provides convenient methods to invalidate related queries
 */
export const cacheUtils = {
  /**
   * Invalidate all issues-related queries
   */
  invalidateIssues: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
  },
  
  /**
   * Invalidate specific issue and related data
   */
  invalidateIssue: (issueId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.issues.detail(issueId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.comments.byIssue(issueId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.solutions.byIssue(issueId) });
  },
  
  /**
   * Invalidate user-related queries
   */
  invalidateUser: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.users.stats(userId) });
  },
  
  /**
   * Invalidate dashboard statistics
   */
  invalidateDashboard: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  },
  
  /**
   * Clear all cached data (use sparingly)
   */
  clearAll: () => {
    queryClient.clear();
  },
  
  /**
   * Remove specific query from cache
   */
  removeQuery: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey });
  },
  
  /**
   * Prefetch data for better UX
   */
  prefetchIssues: async (filters: Record<string, any> = {}) => {
    const { getIssues } = await import('@/lib/api/issues');
    return queryClient.prefetchQuery({
      queryKey: queryKeys.issues.list(filters),
      queryFn: () => getIssues(filters),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  },
  
  /**
   * Prefetch issue details
   */
  prefetchIssue: async (issueId: string) => {
    const { getIssueById } = await import('@/lib/api/issues');
    return queryClient.prefetchQuery({
      queryKey: queryKeys.issues.detail(issueId),
      queryFn: () => getIssueById(issueId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  },
};

/**
 * Performance monitoring utilities
 */
export const performanceUtils = {
  /**
   * Get cache statistics
   */
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cacheSize: JSON.stringify(cache).length,
    };
  },
  
  /**
   * Log cache performance metrics
   */
  logCacheMetrics: () => {
    const stats = performanceUtils.getCacheStats();
    console.group('🚀 React Query Cache Metrics');
    console.log('Total Queries:', stats.totalQueries);
    console.log('Active Queries:', stats.activeQueries);
    console.log('Stale Queries:', stats.staleQueries);
    console.log('Error Queries:', stats.errorQueries);
    console.log('Cache Size (bytes):', stats.cacheSize);
    console.groupEnd();
  },
};

// Development tools
if (process.env['NODE_ENV'] === 'development') {
  // Log cache metrics every 30 seconds in development
  setInterval(() => {
    performanceUtils.logCacheMetrics();
  }, 30000);
}
