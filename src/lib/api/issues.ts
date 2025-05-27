/**
 * Optimized Issues API with pagination, caching, and performance improvements
 */

import { supabase } from '@/lib/supabase';
import { cacheData, getCachedData, clearCache } from '@/lib/utils/performanceUtils';
import { handleApiError } from '@/lib/utils/errorHandler';
import type { Database } from '@/types/supabase';

type Issue = Database['public']['Tables']['issues']['Row'];
type IssueInsert = Database['public']['Tables']['issues']['Insert'];
type IssueUpdate = Database['public']['Tables']['issues']['Update'];

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IssueFilters {
  category?: string;
  status?: string;
  constituency?: string;
  department_id?: string;
  search?: string;
  author_id?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Get issues with pagination, filtering, and caching
 */
export const getIssues = async (
  filters: IssueFilters = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<Issue>> => {
  try {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = pagination;

    // Create cache key based on filters and pagination
    const cacheKey = `issues_${JSON.stringify({ filters, pagination })}`;
    const cached = getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build optimized query with enhanced schema support
    let query = supabase
      .from('issues')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          role
        ),
        departments (
          id,
          name,
          description
        )
      `, { count: 'exact' })
      .range(from, to)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply filters efficiently
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.constituency) {
      query = query.eq('constituency', filters.constituency);
    }

    if (filters.department_id) {
      query = query.eq('department_id', filters.department_id);
    }

    if (filters.author_id) {
      query = query.eq('author_id', filters.author_id);
    }

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      handleApiError(error, 'IssuesAPI', 'getIssues');
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / pageSize);
    const result: PaginatedResult<Issue> = {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    // Cache for 2 minutes
    cacheData(cacheKey, result, 120);

    return result;
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw error;
  }
};

/**
 * Get a single issue by ID with related data
 */
export const getIssueById = async (id: string): Promise<Issue | null> => {
  try {
    const cacheKey = `issue_${id}`;
    const cached = getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('issues')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          role
        ),
        departments (
          id,
          name,
          description
        ),
        comments (
          id,
          content,
          is_official,
          parent_id,
          attachments,
          created_at,
          updated_at,
          profiles:author_id (
            id,
            full_name,
            avatar_url,
            role
          )
        ),
        solutions (
          id,
          title,
          description,
          implementation_plan,
          estimated_cost,
          estimated_timeline,
          vote_count,
          is_official,
          status,
          created_at,
          updated_at,
          profiles:author_id (
            id,
            full_name,
            avatar_url,
            role
          )
        ),
        updates (
          id,
          title,
          content,
          status_change,
          is_official,
          attachments,
          created_at,
          updated_at,
          profiles:author_id (
            id,
            full_name,
            avatar_url,
            role
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Issue not found
      }
      handleApiError(error, 'IssuesAPI', 'getIssueById');
      throw error;
    }

    // Cache for 5 minutes
    cacheData(cacheKey, data, 300);

    return data;
  } catch (error) {
    console.error('Error fetching issue:', error);
    throw error;
  }
};

/**
 * Create a new issue
 */
export const createIssue = async (issueData: IssueInsert): Promise<Issue> => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .insert(issueData)
      .select()
      .single();

    if (error) {
      handleApiError(error, 'IssuesAPI', 'createIssue');
      throw error;
    }

    // Clear relevant caches
    clearCache('issues_');
    clearCache('dashboard_stats');

    return data;
  } catch (error) {
    console.error('Error creating issue:', error);
    throw error;
  }
};

/**
 * Update an issue
 */
export const updateIssue = async (
  id: string,
  updates: IssueUpdate
): Promise<Issue> => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleApiError(error, 'IssuesAPI', 'updateIssue');
      throw error;
    }

    // Clear relevant caches
    clearCache('issues_');
    clearCache(`issue_${id}`);
    clearCache('dashboard_stats');

    return data;
  } catch (error) {
    console.error('Error updating issue:', error);
    throw error;
  }
};

/**
 * Delete an issue
 */
export const deleteIssue = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id);

    if (error) {
      handleApiError(error, 'IssuesAPI', 'deleteIssue');
      throw error;
    }

    // Clear relevant caches
    clearCache('issues_');
    clearCache(`issue_${id}`);
    clearCache('dashboard_stats');
  } catch (error) {
    console.error('Error deleting issue:', error);
    throw error;
  }
};

/**
 * Get issues statistics for dashboard
 */
export const getIssuesStats = async (): Promise<{
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}> => {
  try {
    const cacheKey = 'issues_stats';
    const cached = getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    // Use database function for better performance
    const { data, error } = await supabase.rpc('get_issues_stats');

    if (error) {
      // Fallback to individual queries if RPC fails
      const [total, open, inProgress, resolved, closed] = await Promise.all([
        supabase.from('issues').select('id', { count: 'exact', head: true }),
        supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'in-progress'),
        supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'closed'),
      ]);

      const stats = {
        total: total.count || 0,
        open: open.count || 0,
        inProgress: inProgress.count || 0,
        resolved: resolved.count || 0,
        closed: closed.count || 0,
      };

      // Cache for 5 minutes
      cacheData(cacheKey, stats, 300);
      return stats;
    }

    // Cache for 5 minutes
    cacheData(cacheKey, data, 300);
    return data;
  } catch (error) {
    console.error('Error fetching issues stats:', error);
    throw error;
  }
};
