/**
 * Enhanced Issues API - Updated for enhanced database schema
 * Provides optimized queries using new schema fields and relationships
 */

import { supabase } from '@/lib/supabase';
import { handleApiError } from '@/lib/utils/errorHandler';
import { transformers } from '@/lib/utils/dataTransformers';
import type { UIIssue, Issue, Profile, Department } from '@/types/enhanced';

export interface EnhancedIssueFilters {
  category?: string;
  status?: 'draft' | 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  constituency?: string;
  department_id?: string;
  author_id?: string;
  assigned_to?: string;
  tags?: string[];
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get issues with enhanced schema support
 */
export const getEnhancedIssues = async (
  filters: EnhancedIssueFilters = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<UIIssue>> => {
  try {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = pagination;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build optimized query with enhanced schema fields
    let query = supabase
      .from('issues')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          role,
          department_id
        ),
        departments (
          id,
          name,
          description,
          category
        ),
        assigned_profile:assigned_to (
          id,
          full_name,
          avatar_url,
          role
        )
      `, { count: 'exact' })
      .range(from, to)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply enhanced filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
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

    if (filters.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      handleApiError(error, 'EnhancedIssuesAPI', 'getEnhancedIssues');
      throw error;
    }

    // Transform to UI-safe format
    const transformedIssues = (data || []).map(issue => transformers.toUIIssue(issue));

    return {
      data: transformedIssues,
      count: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  } catch (error) {
    console.error('Error fetching enhanced issues:', error);
    throw error;
  }
};

/**
 * Get a single issue with full enhanced data
 */
export const getEnhancedIssueById = async (id: string): Promise<UIIssue | null> => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          role,
          department_id
        ),
        departments (
          id,
          name,
          description,
          category,
          contact_email,
          contact_phone
        ),
        assigned_profile:assigned_to (
          id,
          full_name,
          avatar_url,
          role
        ),
        resolved_profile:resolved_by (
          id,
          full_name,
          avatar_url,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Issue not found
      }
      handleApiError(error, 'EnhancedIssuesAPI', 'getEnhancedIssueById');
      throw error;
    }

    return transformers.toUIIssue(data);
  } catch (error) {
    console.error('Error fetching enhanced issue:', error);
    throw error;
  }
};

/**
 * Get issues by department with enhanced filtering
 */
export const getIssuesByDepartment = async (
  departmentId: string,
  filters: Omit<EnhancedIssueFilters, 'department_id'> = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<UIIssue>> => {
  return getEnhancedIssues(
    { ...filters, department_id: departmentId },
    pagination
  );
};

/**
 * Get user's issues with enhanced data
 */
export const getUserIssues = async (
  userId: string,
  filters: Omit<EnhancedIssueFilters, 'author_id'> = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<UIIssue>> => {
  return getEnhancedIssues(
    { ...filters, author_id: userId },
    pagination
  );
};

/**
 * Get assigned issues for stakeholders
 */
export const getAssignedIssues = async (
  userId: string,
  filters: Omit<EnhancedIssueFilters, 'assigned_to'> = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<UIIssue>> => {
  return getEnhancedIssues(
    { ...filters, assigned_to: userId },
    pagination
  );
};

/**
 * Update issue status with enhanced tracking
 */
export const updateIssueStatus = async (
  issueId: string,
  newStatus: 'draft' | 'open' | 'in_progress' | 'resolved' | 'closed',
  userId?: string
): Promise<void> => {
  try {
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Set resolved fields if resolving
    if (newStatus === 'resolved' && userId) {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = userId;
    }

    // Set first response time if moving from open to in_progress
    if (newStatus === 'in_progress') {
      const { data: currentIssue } = await supabase
        .from('issues')
        .select('first_response_at, status')
        .eq('id', issueId)
        .single();

      if (currentIssue && currentIssue.status === 'open' && !currentIssue.first_response_at) {
        updateData.first_response_at = new Date().toISOString();
      }
    }

    const { error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', issueId);

    if (error) {
      handleApiError(error, 'EnhancedIssuesAPI', 'updateIssueStatus');
      throw error;
    }
  } catch (error) {
    console.error('Error updating issue status:', error);
    throw error;
  }
};

/**
 * Increment view count for an issue
 */
export const incrementViewCount = async (issueId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_view_count', {
      issue_id: issueId
    });

    if (error) {
      console.error('Error incrementing view count:', error);
      // Don't throw error for view count failures
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
    // Don't throw error for view count failures
  }
};
