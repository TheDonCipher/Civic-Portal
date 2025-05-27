/**
 * @fileoverview React Query Hooks for Issues
 * @description Optimized React Query hooks for issues management with
 * caching, background updates, and optimistic updates.
 *
 * @author Civic Portal Team
 * @version 1.0.0
 * @since 2024-01-01
 *
 * @example Basic Usage
 * ```typescript
 * import { useIssues, useIssue, useCreateIssue } from '@/lib/query/hooks/useIssues';
 *
 * function IssuesList() {
 *   const { data: issues, isLoading, error } = useIssues();
 *   const createIssue = useCreateIssue();
 *
 *   return (
 *     <div>
 *       {issues?.data.map(issue => (
 *         <IssueCard key={issue.id} issue={issue} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  getIssuesStats,
  type PaginationOptions,
  type IssueFilters,
  type PaginatedResult
} from '@/lib/api/issues';
import { queryKeys, cacheUtils } from '../queryClient';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/types/supabase';

type Issue = Database['public']['Tables']['issues']['Row'];
type IssueInsert = Database['public']['Tables']['issues']['Insert'];
type IssueUpdate = Database['public']['Tables']['issues']['Update'];

/**
 * Hook to fetch paginated issues with filtering and caching
 *
 * @param filters - Filtering options for issues
 * @param pagination - Pagination options
 * @param options - Additional React Query options
 * @returns Query result with issues data
 *
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useIssues(
 *   { category: 'infrastructure', status: 'open' },
 *   { page: 1, pageSize: 20 }
 * );
 * ```
 */
export function useIssues(
  filters: IssueFilters = {},
  pagination: PaginationOptions = {},
  options?: Omit<UseQueryOptions<PaginatedResult<Issue>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.issues.list({ filters, pagination }),
    queryFn: () => getIssues(filters, pagination),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  });
}

/**
 * Hook for infinite scrolling issues list
 *
 * @param filters - Filtering options for issues
 * @param pageSize - Number of items per page
 * @returns Infinite query result for issues
 *
 * @example
 * ```typescript
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage
 * } = useInfiniteIssues({ category: 'infrastructure' });
 * ```
 */
export function useInfiniteIssues(
  filters: IssueFilters = {},
  pageSize: number = 20
) {
  return useInfiniteQuery({
    queryKey: queryKeys.issues.list({ filters, infinite: true }),
    queryFn: ({ pageParam = 1 }) =>
      getIssues(filters, { page: pageParam, pageSize }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch a single issue by ID
 *
 * @param issueId - The issue ID to fetch
 * @param options - Additional React Query options
 * @returns Query result with issue data
 *
 * @example
 * ```typescript
 * const { data: issue, isLoading } = useIssue('issue-123');
 * ```
 */
export function useIssue(
  issueId: string,
  options?: Omit<UseQueryOptions<Issue | null>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.issues.detail(issueId),
    queryFn: () => getIssueById(issueId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!issueId,
    ...options,
  });
}

/**
 * Hook to fetch issues statistics
 *
 * @param options - Additional React Query options
 * @returns Query result with issues statistics
 *
 * @example
 * ```typescript
 * const { data: stats } = useIssuesStats();
 * // stats: { total: 100, open: 50, inProgress: 20, resolved: 25, closed: 5 }
 * ```
 */
export function useIssuesStats(
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queryKeys.issues.stats(),
    queryFn: getIssuesStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    ...options,
  });
}

/**
 * Hook to create a new issue with optimistic updates
 *
 * @param options - Additional mutation options
 * @returns Mutation object for creating issues
 *
 * @example
 * ```typescript
 * const createIssue = useCreateIssue({
 *   onSuccess: () => {
 *     toast({ title: 'Issue created successfully!' });
 *   }
 * });
 *
 * const handleSubmit = (data) => {
 *   createIssue.mutate(data);
 * };
 * ```
 */
export function useCreateIssue(
  options?: UseMutationOptions<Issue, Error, IssueInsert>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createIssue,
    onMutate: async (newIssue) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.issues.all });

      // Snapshot previous value
      const previousIssues = queryClient.getQueriesData({
        queryKey: queryKeys.issues.lists()
      });

      // Optimistically update issues lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.issues.lists() },
        (old: PaginatedResult<Issue> | undefined) => {
          if (!old) return old;

          const optimisticIssue: Issue = {
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            votes: 0,
            watchers_count: 0,
            ...newIssue,
          } as Issue;

          return {
            ...old,
            data: [optimisticIssue, ...old.data],
            count: old.count + 1,
          };
        }
      );

      return { previousIssues };
    },
    onError: (error, newIssue, context) => {
      // Rollback optimistic update
      if (context?.previousIssues) {
        context.previousIssues.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast({
        title: 'Error',
        description: 'Failed to create issue. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      // Invalidate and refetch issues
      cacheUtils.invalidateIssues();
      cacheUtils.invalidateDashboard();

      toast({
        title: 'Success',
        description: 'Issue created successfully!',
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });
    },
    ...options,
  });
}

/**
 * Hook to update an existing issue
 *
 * @param options - Additional mutation options
 * @returns Mutation object for updating issues
 *
 * @example
 * ```typescript
 * const updateIssue = useUpdateIssue();
 *
 * const handleStatusChange = (issueId, status) => {
 *   updateIssue.mutate({ issueId, updates: { status } });
 * };
 * ```
 */
export function useUpdateIssue(
  options?: UseMutationOptions<Issue, Error, { issueId: string; updates: IssueUpdate }>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ issueId, updates }) => updateIssue(issueId, updates),
    onMutate: async ({ issueId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.issues.detail(issueId) });

      // Snapshot previous value
      const previousIssue = queryClient.getQueryData(queryKeys.issues.detail(issueId));

      // Optimistically update issue
      queryClient.setQueryData(
        queryKeys.issues.detail(issueId),
        (old: Issue | undefined) => {
          if (!old) return old;
          return { ...old, ...updates, updated_at: new Date().toISOString() };
        }
      );

      return { previousIssue, issueId };
    },
    onError: (error, { issueId }, context) => {
      // Rollback optimistic update
      if (context?.previousIssue) {
        queryClient.setQueryData(queryKeys.issues.detail(issueId), context.previousIssue);
      }

      toast({
        title: 'Error',
        description: 'Failed to update issue. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: (data, { issueId }) => {
      // Update cache with server response
      queryClient.setQueryData(queryKeys.issues.detail(issueId), data);

      // Invalidate related queries
      cacheUtils.invalidateIssue(issueId);
      cacheUtils.invalidateDashboard();

      toast({
        title: 'Success',
        description: 'Issue updated successfully!',
      });
    },
    ...options,
  });
}

/**
 * Hook to delete an issue
 *
 * @param options - Additional mutation options
 * @returns Mutation object for deleting issues
 *
 * @example
 * ```typescript
 * const deleteIssue = useDeleteIssue();
 *
 * const handleDelete = (issueId) => {
 *   if (confirm('Are you sure?')) {
 *     deleteIssue.mutate(issueId);
 *   }
 * };
 * ```
 */
export function useDeleteIssue(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteIssue,
    onMutate: async (issueId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.issues.all });

      // Remove issue from cache
      queryClient.removeQueries({ queryKey: queryKeys.issues.detail(issueId) });

      // Optimistically remove from lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.issues.lists() },
        (old: PaginatedResult<Issue> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter(issue => issue.id !== issueId),
            count: old.count - 1,
          };
        }
      );

      return { issueId };
    },
    onError: (error, issueId) => {
      // Refetch to restore correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.all });

      toast({
        title: 'Error',
        description: 'Failed to delete issue. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: (data, issueId) => {
      // Invalidate related queries
      cacheUtils.invalidateIssues();
      cacheUtils.invalidateDashboard();

      toast({
        title: 'Success',
        description: 'Issue deleted successfully!',
      });
    },
    ...options,
  });
}
