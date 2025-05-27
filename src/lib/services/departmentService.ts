/**
 * Department Service
 * Handles department-related operations including name to ID mapping
 */

import { supabase } from '@/lib/supabase';

export interface Department {
  id: string;
  name: string;
  description?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get department ID by department name
 */
export async function getDepartmentIdByName(
  departmentName: string
): Promise<{ success: boolean; departmentId?: string; error?: string }> {
  try {
    if (!departmentName) {
      return {
        success: false,
        error: 'Department name is required',
      };
    }

    const { data, error } = await supabase
      .from('departments')
      .select('id')
      .eq('name', departmentName)
      .single();

    if (error) {
      console.error('Error fetching department:', error);
      return {
        success: false,
        error: `Department "${departmentName}" not found`,
      };
    }

    return {
      success: true,
      departmentId: data.id,
    };
  } catch (error: any) {
    console.error('Failed to get department ID:', error);
    return {
      success: false,
      error: error.message || 'Failed to get department ID',
    };
  }
}

/**
 * Get all departments
 */
export async function getAllDepartments(): Promise<{
  success: boolean;
  departments?: Department[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching departments:', error);
      return {
        success: false,
        error: 'Failed to fetch departments',
      };
    }

    return {
      success: true,
      departments: data as Department[],
    };
  } catch (error: any) {
    console.error('Failed to get departments:', error);
    return {
      success: false,
      error: error.message || 'Failed to get departments',
    };
  }
}

/**
 * Get department by ID
 */
export async function getDepartmentById(
  departmentId: string
): Promise<{ success: boolean; department?: Department; error?: string }> {
  try {
    if (!departmentId) {
      return {
        success: false,
        error: 'Department ID is required',
      };
    }

    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', departmentId)
      .single();

    if (error) {
      console.error('Error fetching department:', error);
      return {
        success: false,
        error: 'Department not found',
      };
    }

    return {
      success: true,
      department: data as Department,
    };
  } catch (error: any) {
    console.error('Failed to get department:', error);
    return {
      success: false,
      error: error.message || 'Failed to get department',
    };
  }
}
