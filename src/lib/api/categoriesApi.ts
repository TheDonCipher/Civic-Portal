/**
 * Categories API
 * Handles issue category operations and department associations
 */

import { supabase } from '@/lib/supabase';

export interface IssueCategory {
  id: string;
  name: string;
  description?: string;
  department_id?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithDepartment extends IssueCategory {
  department?: {
    id: string;
    name: string;
    description?: string;
  };
}

// Fallback categories if database table doesn't exist
const FALLBACK_CATEGORIES: Omit<IssueCategory, 'id' | 'created_at' | 'updated_at'>[] = [
  { name: 'Infrastructure', description: 'Roads, buildings, and public infrastructure', department_id: '', icon: 'building', color: '#3B82F6', is_active: true },
  { name: 'Healthcare', description: 'Health services and medical facilities', department_id: '', icon: 'heart', color: '#EF4444', is_active: true },
  { name: 'Education', description: 'Schools, education services, and learning facilities', department_id: '', icon: 'book', color: '#10B981', is_active: true },
  { name: 'Environment', description: 'Environmental issues and conservation', department_id: '', icon: 'leaf', color: '#059669', is_active: true },
  { name: 'Water & Sanitation', description: 'Water supply, sewage, and sanitation', department_id: '', icon: 'droplets', color: '#0EA5E9', is_active: true },
  { name: 'Public Safety', description: 'Crime, security, and safety concerns', department_id: '', icon: 'shield', color: '#DC2626', is_active: true },
  { name: 'Energy', description: 'Electricity, power supply, and energy infrastructure', department_id: '', icon: 'zap', color: '#F59E0B', is_active: true },
  { name: 'Community Development', description: 'Community services and development', department_id: '', icon: 'users', color: '#7C3AED', is_active: true },
];

/**
 * Get all active issue categories
 */
export const getAllCategories = async (): Promise<IssueCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('issue_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.warn('Could not fetch categories from database, using fallback:', error);
      return FALLBACK_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: (index + 1).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }

    if (!data || data.length === 0) {
      console.log('No categories found in database, using fallback');
      return FALLBACK_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: (index + 1).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }

    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return FALLBACK_CATEGORIES.map((cat, index) => ({
      ...cat,
      id: (index + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }
};

/**
 * Get categories for a specific department
 */
export const getCategoriesByDepartment = async (departmentId: string): Promise<IssueCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('issue_categories')
      .select('*')
      .eq('department_id', departmentId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.warn('Could not fetch department categories, using fallback:', error);
      return FALLBACK_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: (index + 1).toString(),
        department_id: departmentId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching department categories:', error);
    return [];
  }
};

/**
 * Get categories with their associated departments
 */
export const getCategoriesWithDepartments = async (): Promise<CategoryWithDepartment[]> => {
  try {
    const { data, error } = await supabase
      .from('issue_categories')
      .select(`
        *,
        department:departments(
          id,
          name,
          description
        )
      `)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.warn('Could not fetch categories with departments, using fallback:', error);
      return FALLBACK_CATEGORIES.map((cat, index) => ({
        ...cat,
        id: (index + 1).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching categories with departments:', error);
    return FALLBACK_CATEGORIES.map((cat, index) => ({
      ...cat,
      id: (index + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (categoryId: string): Promise<IssueCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('issue_categories')
      .select('*')
      .eq('id', categoryId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.warn('Could not fetch category by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    return null;
  }
};

/**
 * Create a new category (admin only)
 */
export const createCategory = async (category: Omit<IssueCategory, 'id' | 'created_at' | 'updated_at'>): Promise<IssueCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('issue_categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Update a category (admin only)
 */
export const updateCategory = async (categoryId: string, updates: Partial<Omit<IssueCategory, 'id' | 'created_at' | 'updated_at'>>): Promise<IssueCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('issue_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete a category (admin only) - soft delete by setting is_active to false
 */
export const deleteCategory = async (categoryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('issue_categories')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Get category statistics
 */
export const getCategoryStats = async (departmentId?: string) => {
  try {
    let query = supabase
      .from('issues')
      .select('category, status, department_id');

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching category stats:', error);
      return {};
    }

    // Group by category and calculate stats
    const stats = data?.reduce((acc: any, issue: any) => {
      const category = issue.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          open: 0,
          in_progress: 0,
          resolved: 0,
          closed: 0,
        };
      }
      acc[category].total++;
      acc[category][issue.status] = (acc[category][issue.status] || 0) + 1;
      return acc;
    }, {});

    return stats || {};
  } catch (error) {
    console.error('Error calculating category stats:', error);
    return {};
  }
};
