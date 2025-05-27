/**
 * Centralized API functions for issue management with consistent data structure
 */

import { supabase } from '@/lib/supabase';
import { createAuthorObject } from '@/lib/utils/userUtils';
import type { UIIssue } from '@/types/enhanced';

/**
 * Enhanced query to fetch issues with all related data
 * Note: category is a TEXT field, not a foreign key to issue_categories
 */
const ISSUES_QUERY = `
  *,
  profiles:author_id (
    id,
    username,
    full_name,
    avatar_url,
    role,
    constituency
  ),
  departments:department_id (
    id,
    name,
    description
  )
`;

/**
 * Transform database issue to UI issue format
 */
export const transformIssueForUI = (dbIssue: any): UIIssue => {
  const profile = dbIssue.profiles;

  return {
    id: dbIssue.id,
    title: dbIssue.title,
    description: dbIssue.description,
    category: dbIssue.category,
    status: dbIssue.status,
    priority: dbIssue.priority || 'medium',
    location: dbIssue.location,
    constituency: dbIssue.constituency,
    department: dbIssue.departments?.name || 'Unknown Department',
    department_id: dbIssue.department_id,
    author_id: dbIssue.author_id,
    author: createAuthorObject(profile, null, dbIssue.author_id),
    thumbnail: dbIssue.thumbnail || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&crop=center',
    date: dbIssue.created_at,
    created_at: dbIssue.created_at,
    updated_at: dbIssue.updated_at,
    votes: dbIssue.vote_count || 0,
    vote_count: dbIssue.vote_count || 0,
    comments: dbIssue.comment_count || 0,
    comment_count: dbIssue.comment_count || 0,
    watchers: dbIssue.watchers_count || 0,
    watchers_count: dbIssue.watchers_count || 0,
    view_count: dbIssue.view_count || 0,
    tags: dbIssue.tags || [],
  };
};

/**
 * Fetch all issues with pagination and filtering
 */
export const fetchIssues = async (options: {
  limit?: number;
  offset?: number;
  status?: string;
  category?: string;
  department_id?: string;
  constituency?: string;
  search?: string;
  author_id?: string;
} = {}): Promise<{ issues: UIIssue[]; total: number }> => {
  try {
    let query = supabase
      .from('issues')
      .select(ISSUES_QUERY, { count: 'exact' });

    // Apply filters
    if (options.status) {
      query = query.eq('status', options.status);
    }
    if (options.category) {
      query = query.eq('category', options.category);
    }
    if (options.department_id) {
      query = query.eq('department_id', options.department_id);
    }
    if (options.constituency) {
      query = query.eq('constituency', options.constituency);
    }
    if (options.author_id) {
      query = query.eq('author_id', options.author_id);
    }
    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    // Order by created_at desc
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }

    const transformedIssues = (data || []).map(transformIssueForUI);

    return {
      issues: transformedIssues,
      total: count || 0,
    };
  } catch (error) {
    console.error('Error in fetchIssues:', error);
    throw error;
  }
};

/**
 * Fetch a single issue by ID
 */
export const fetchIssueById = async (id: string): Promise<UIIssue | null> => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select(ISSUES_QUERY)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching issue:', error);
      throw error;
    }

    return data ? transformIssueForUI(data) : null;
  } catch (error) {
    console.error('Error in fetchIssueById:', error);
    throw error;
  }
};

/**
 * Fetch issues by user ID (created by user)
 */
export const fetchUserIssues = async (userId: string): Promise<UIIssue[]> => {
  try {
    const { issues } = await fetchIssues({ author_id: userId });
    return issues;
  } catch (error) {
    console.error('Error fetching user issues:', error);
    throw error;
  }
};

/**
 * Fetch issues watched by user
 */
export const fetchWatchedIssues = async (userId: string): Promise<UIIssue[]> => {
  try {
    const { data: watchedIssueIds, error: watchError } = await supabase
      .from('watchers')
      .select('issue_id')
      .eq('user_id', userId);

    if (watchError) {
      console.error('Error fetching watched issues:', watchError);
      throw watchError;
    }

    if (!watchedIssueIds || watchedIssueIds.length === 0) {
      return [];
    }

    const issueIds = watchedIssueIds.map(w => w.issue_id);

    const { data, error } = await supabase
      .from('issues')
      .select(ISSUES_QUERY)
      .in('id', issueIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching watched issues data:', error);
      throw error;
    }

    return (data || []).map(transformIssueForUI);
  } catch (error) {
    console.error('Error in fetchWatchedIssues:', error);
    throw error;
  }
};

/**
 * Update issue status (for stakeholders)
 */
export const updateIssueStatus = async (
  issueId: string,
  status: string,
  userId: string
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Set resolved_at if status is resolved
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = userId;
    }

    const { error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', issueId);

    if (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateIssueStatus:', error);
    throw error;
  }
};

/**
 * Delete an issue (only by author)
 */
export const deleteIssue = async (issueId: string, userId: string): Promise<void> => {
  try {
    // First verify the user owns this issue
    const { data: issue, error: fetchError } = await supabase
      .from('issues')
      .select('author_id')
      .eq('id', issueId)
      .single();

    if (fetchError) {
      console.error('Error fetching issue for deletion:', fetchError);
      throw fetchError;
    }

    if (issue.author_id !== userId) {
      throw new Error('You can only delete your own issues');
    }

    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', issueId);

    if (error) {
      console.error('Error deleting issue:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteIssue:', error);
    throw error;
  }
};
