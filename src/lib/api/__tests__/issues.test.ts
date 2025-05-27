/**
 * @fileoverview Issues API Tests
 * @description Comprehensive tests for the optimized issues API including
 * pagination, caching, filtering, and error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getIssues, 
  getIssueById, 
  createIssue, 
  updateIssue, 
  deleteIssue,
  getIssuesStats 
} from '../issues';
import { createMockIssue } from '@/test/utils';

// Mock the performance utils
vi.mock('@/lib/utils/performanceUtils', () => ({
  cacheData: vi.fn(),
  getCachedData: vi.fn().mockReturnValue(null),
  clearCache: vi.fn(),
}));

// Mock the error handler
vi.mock('@/lib/utils/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

// Mock Supabase
const mockSupabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }),
  rpc: vi.fn(),
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('Issues API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getIssues', () => {
    it('should fetch issues with default pagination', async () => {
      const mockIssues = [createMockIssue(), createMockIssue()];
      
      mockSupabase.from().select.mockResolvedValue({
        data: mockIssues,
        error: null,
        count: 2,
      });

      const result = await getIssues();

      expect(result).toEqual({
        data: mockIssues,
        count: 2,
        page: 1,
        pageSize: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('issues');
      expect(mockSupabase.from().range).toHaveBeenCalledWith(0, 19);
    });

    it('should apply filters correctly', async () => {
      const filters = {
        category: 'infrastructure',
        status: 'open',
        search: 'test query',
      };

      mockSupabase.from().select.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      await getIssues(filters);

      expect(mockSupabase.from().eq).toHaveBeenCalledWith('category', 'infrastructure');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('status', 'open');
      expect(mockSupabase.from().or).toHaveBeenCalledWith(
        'title.ilike.%test query%,description.ilike.%test query%'
      );
    });

    it('should handle pagination correctly', async () => {
      const pagination = {
        page: 2,
        pageSize: 10,
        sortBy: 'title',
        sortOrder: 'asc' as const,
      };

      mockSupabase.from().select.mockResolvedValue({
        data: [],
        error: null,
        count: 25,
      });

      const result = await getIssues({}, pagination);

      expect(mockSupabase.from().range).toHaveBeenCalledWith(10, 19);
      expect(mockSupabase.from().order).toHaveBeenCalledWith('title', { ascending: true });
      expect(result.totalPages).toBe(3);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPreviousPage).toBe(true);
    });

    it('should use cached data when available', async () => {
      const { getCachedData } = await import('@/lib/utils/performanceUtils');
      const cachedResult = { data: [], count: 0 };
      
      vi.mocked(getCachedData).mockReturnValue(cachedResult);

      const result = await getIssues();

      expect(result).toBe(cachedResult);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('Database error');
      mockSupabase.from().select.mockResolvedValue({
        data: null,
        error,
        count: null,
      });

      await expect(getIssues()).rejects.toThrow('Database error');

      const { handleApiError } = await import('@/lib/utils/errorHandler');
      expect(handleApiError).toHaveBeenCalledWith(error, 'IssuesAPI', 'getIssues');
    });
  });

  describe('getIssueById', () => {
    it('should fetch single issue with related data', async () => {
      const mockIssue = createMockIssue();
      
      mockSupabase.from().single.mockResolvedValue({
        data: mockIssue,
        error: null,
      });

      const result = await getIssueById('test-id');

      expect(result).toBe(mockIssue);
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'test-id');
      expect(mockSupabase.from().select).toHaveBeenCalledWith(
        expect.stringContaining('profiles:author_id')
      );
    });

    it('should return null for non-existent issue', async () => {
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await getIssueById('non-existent');

      expect(result).toBeNull();
    });

    it('should use cached data when available', async () => {
      const { getCachedData } = await import('@/lib/utils/performanceUtils');
      const cachedIssue = createMockIssue();
      
      vi.mocked(getCachedData).mockReturnValue(cachedIssue);

      const result = await getIssueById('test-id');

      expect(result).toBe(cachedIssue);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('createIssue', () => {
    it('should create new issue and clear cache', async () => {
      const newIssue = createMockIssue();
      const issueData = {
        title: 'New Issue',
        description: 'Issue description',
        category: 'infrastructure',
        author_id: 'user-id',
      };

      mockSupabase.from().single.mockResolvedValue({
        data: newIssue,
        error: null,
      });

      const result = await createIssue(issueData);

      expect(result).toBe(newIssue);
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(issueData);

      const { clearCache } = await import('@/lib/utils/performanceUtils');
      expect(clearCache).toHaveBeenCalledWith('issues_');
      expect(clearCache).toHaveBeenCalledWith('dashboard_stats');
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error,
      });

      await expect(createIssue({})).rejects.toThrow('Creation failed');
    });
  });

  describe('updateIssue', () => {
    it('should update issue and clear relevant caches', async () => {
      const updatedIssue = createMockIssue();
      const updates = { status: 'resolved' };

      mockSupabase.from().single.mockResolvedValue({
        data: updatedIssue,
        error: null,
      });

      const result = await updateIssue('test-id', updates);

      expect(result).toBe(updatedIssue);
      expect(mockSupabase.from().update).toHaveBeenCalledWith(updates);
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'test-id');

      const { clearCache } = await import('@/lib/utils/performanceUtils');
      expect(clearCache).toHaveBeenCalledWith('issues_');
      expect(clearCache).toHaveBeenCalledWith('issue_test-id');
    });
  });

  describe('deleteIssue', () => {
    it('should delete issue and clear caches', async () => {
      mockSupabase.from().delete.mockResolvedValue({
        error: null,
      });

      await deleteIssue('test-id');

      expect(mockSupabase.from().delete).toHaveBeenCalled();
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'test-id');

      const { clearCache } = await import('@/lib/utils/performanceUtils');
      expect(clearCache).toHaveBeenCalledWith('issues_');
      expect(clearCache).toHaveBeenCalledWith('issue_test-id');
    });
  });

  describe('getIssuesStats', () => {
    it('should fetch stats using RPC function', async () => {
      const mockStats = {
        total: 100,
        open: 50,
        inProgress: 20,
        resolved: 25,
        closed: 5,
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await getIssuesStats();

      expect(result).toBe(mockStats);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_issues_stats');
    });

    it('should fallback to individual queries if RPC fails', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: new Error('RPC failed'),
      });

      // Mock individual count queries
      const mockCountQuery = {
        count: 10,
      };
      mockSupabase.from().select.mockResolvedValue(mockCountQuery);

      const result = await getIssuesStats();

      expect(result).toEqual({
        total: 10,
        open: 10,
        inProgress: 10,
        resolved: 10,
        closed: 10,
      });
    });

    it('should use cached stats when available', async () => {
      const { getCachedData } = await import('@/lib/utils/performanceUtils');
      const cachedStats = { total: 50, open: 25, inProgress: 10, resolved: 10, closed: 5 };
      
      vi.mocked(getCachedData).mockReturnValue(cachedStats);

      const result = await getIssuesStats();

      expect(result).toBe(cachedStats);
      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabase.from().select.mockRejectedValue(new Error('Network error'));

      await expect(getIssues()).rejects.toThrow('Network error');
    });

    it('should handle malformed responses', async () => {
      mockSupabase.from().select.mockResolvedValue({
        data: null,
        error: null,
        count: null,
      });

      const result = await getIssues();

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should cache successful responses', async () => {
      const mockIssues = [createMockIssue()];
      
      mockSupabase.from().select.mockResolvedValue({
        data: mockIssues,
        error: null,
        count: 1,
      });

      await getIssues();

      const { cacheData } = await import('@/lib/utils/performanceUtils');
      expect(cacheData).toHaveBeenCalledWith(
        expect.stringContaining('issues_'),
        expect.any(Object),
        120 // 2 minutes TTL
      );
    });

    it('should generate proper cache keys for different filters', async () => {
      mockSupabase.from().select.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });

      const filters1 = { category: 'infrastructure' };
      const filters2 = { category: 'environment' };

      await getIssues(filters1);
      await getIssues(filters2);

      const { cacheData } = await import('@/lib/utils/performanceUtils');
      const calls = vi.mocked(cacheData).mock.calls;
      
      expect(calls[0][0]).not.toBe(calls[1][0]); // Different cache keys
    });
  });
});
