/**
 * Optimized Users API with pagination, caching, and performance improvements
 */

import { supabase } from '@/lib/supabase';
import { cacheData, getCachedData, clearCache } from '@/lib/utils/performanceUtils';
import { handleApiError } from '@/lib/utils/errorHandler';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface UserFilters {
  role?: 'citizen' | 'official' | 'admin';
  constituency?: string;
  department_id?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
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
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Get users with pagination, filtering, and caching
 */
export const getUsers = async (
  filters: UserFilters = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<Profile>> => {
  try {
    const {
      page = 1,
      pageSize = 20,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = pagination;

    // Create cache key based on filters and pagination
    const cacheKey = `users_${JSON.stringify({ filters, pagination })}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build optimized query
    let query = supabase
      .from('profiles')
      .select(`
        *,
        departments (
          id,
          name
        )
      `, { count: 'exact' })
      .range(from, to)
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply filters efficiently
    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.constituency) {
      query = query.eq('constituency', filters.constituency);
    }

    if (filters.department_id) {
      query = query.eq('department_id', filters.department_id);
    }

    if (filters.verification_status) {
      query = query.eq('verification_status', filters.verification_status);
    }

    if (filters.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,username.ilike.%${filters.search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      handleApiError(error, 'UsersAPI', 'getUsers');
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / pageSize);
    const result: PaginatedResult<Profile> = {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    // Cache for 3 minutes
    cacheData(cacheKey, result, 180);

    return result;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Get a single user profile by ID
 */
export const getUserById = async (id: string): Promise<Profile | null> => {
  try {
    const cacheKey = `user_${id}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        departments (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      handleApiError(error, 'UsersAPI', 'getUserById');
      throw error;
    }

    // Cache for 10 minutes
    cacheData(cacheKey, data, 600);

    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  id: string,
  updates: ProfileUpdate
): Promise<Profile> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleApiError(error, 'UsersAPI', 'updateUserProfile');
      throw error;
    }

    // Clear relevant caches
    clearCache('users_');
    clearCache(`user_${id}`);

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (userId: string): Promise<{
  issuesCreated: number;
  commentsPosted: number;
  solutionsProposed: number;
  votesReceived: number;
}> => {
  try {
    const cacheKey = `user_stats_${userId}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    // Use parallel queries for better performance
    const [issues, comments, solutions, votes] = await Promise.all([
      supabase
        .from('issues')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userId),
      supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userId),
      supabase
        .from('solutions')
        .select('id', { count: 'exact', head: true })
        .eq('proposed_by', userId),
      supabase
        .from('issue_votes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
    ]);

    const stats = {
      issuesCreated: issues.count || 0,
      commentsPosted: comments.count || 0,
      solutionsProposed: solutions.count || 0,
      votesReceived: votes.count || 0,
    };

    // Cache for 5 minutes
    cacheData(cacheKey, stats, 300);

    return stats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

/**
 * Get users by role with caching
 */
export const getUsersByRole = async (
  role: 'citizen' | 'official' | 'admin'
): Promise<Profile[]> => {
  try {
    const cacheKey = `users_by_role_${role}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        departments (
          id,
          name
        )
      `)
      .eq('role', role)
      .order('full_name', { ascending: true });

    if (error) {
      handleApiError(error, 'UsersAPI', 'getUsersByRole');
      throw error;
    }

    // Cache for 10 minutes
    cacheData(cacheKey, data || [], 600);

    return data || [];
  } catch (error) {
    console.error('Error fetching users by role:', error);
    throw error;
  }
};

/**
 * Get pending verification requests
 */
export const getPendingVerifications = async (): Promise<Profile[]> => {
  try {
    const cacheKey = 'pending_verifications';
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        departments (
          id,
          name
        )
      `)
      .eq('verification_status', 'pending')
      .eq('role', 'official')
      .order('created_at', { ascending: true });

    if (error) {
      handleApiError(error, 'UsersAPI', 'getPendingVerifications');
      throw error;
    }

    // Cache for 2 minutes (shorter cache for admin operations)
    cacheData(cacheKey, data || [], 120);

    return data || [];
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    throw error;
  }
};

/**
 * Update verification status
 */
export const updateVerificationStatus = async (
  userId: string,
  status: 'verified' | 'rejected'
): Promise<Profile> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        verification_status: status,
        is_verified: status === 'verified'
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      handleApiError(error, 'UsersAPI', 'updateVerificationStatus');
      throw error;
    }

    // Clear relevant caches
    clearCache('users_');
    clearCache(`user_${userId}`);
    clearCache('pending_verifications');

    return data;
  } catch (error) {
    console.error('Error updating verification status:', error);
    throw error;
  }
};
