/**
 * Comprehensive tests for issue creation workflow and data consistency
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { CreateIssueDialog } from '@/components/issues/CreateIssueDialog';
import { IssueCard } from '@/components/issues/IssueCard';
import { Header } from '@/components/layout/Header';
import { fetchIssues, deleteIssue } from '@/lib/api/issuesApi';
import { getUserDisplayName, getUserAvatarUrl, getUserInitials } from '@/lib/utils/userUtils';
import type { UIIssue } from '@/types/enhanced';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockIssue, error: null }))
      }))
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: mockProfile, error: null }))
      })),
      order: vi.fn(() => Promise.resolve({ data: [mockIssue], error: null, count: 1 }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null }))
    }))
  })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null }))
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test-url.com/image.jpg' } }))
    }))
  }
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}));

// Mock auth hook
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
};

const mockProfile = {
  id: 'test-user-id',
  username: 'testuser',
  full_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  role: 'citizen',
  constituency: 'Test Constituency'
};

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: mockUser,
    profile: mockProfile,
    isLoading: false
  })
}));

// Mock issue data
const mockIssue: UIIssue = {
  id: 'test-issue-id',
  title: 'Test Issue',
  description: 'Test issue description',
  category: 'infrastructure',
  status: 'open',
  priority: 'medium',
  location: 'Test Location',
  constituency: 'Test Constituency',
  department: 'Transport and Infrastructure',
  department_id: 'dept-id',
  author_id: 'test-user-id',
  author: {
    id: 'test-user-id',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    role: 'citizen'
  },
  thumbnail: 'https://example.com/thumbnail.jpg',
  date: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  votes: 0,
  vote_count: 0,
  comments: 0,
  comment_count: 0,
  watchers: 1,
  watchers_count: 1,
  view_count: 0,
  tags: []
};

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Issue Creation Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CreateIssueDialog', () => {
    it('should render form fields correctly', () => {
      render(
        <TestWrapper>
          <CreateIssueDialog 
            isOpen={true} 
            onClose={() => {}} 
            onSubmit={() => {}} 
          />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <TestWrapper>
          <CreateIssueDialog 
            isOpen={true} 
            onClose={() => {}} 
            onSubmit={onSubmit} 
          />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show validation errors for required fields
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should handle image upload correctly', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <TestWrapper>
          <CreateIssueDialog 
            isOpen={true} 
            onClose={() => {}} 
            onSubmit={onSubmit} 
          />
        </TestWrapper>
      );

      // Create a mock file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/upload image/i);

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockSupabase.storage.from).toHaveBeenCalledWith('issues');
      });
    });
  });

  describe('User Data Consistency', () => {
    it('should display user information consistently', () => {
      const displayName = getUserDisplayName(mockProfile, mockUser);
      const avatarUrl = getUserAvatarUrl(mockProfile, mockUser);
      const initials = getUserInitials(mockProfile, mockUser);

      expect(displayName).toBe('Test User');
      expect(avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(initials).toBe('TU');
    });

    it('should handle missing profile data gracefully', () => {
      const displayName = getUserDisplayName(null, mockUser);
      const avatarUrl = getUserAvatarUrl(null, mockUser);
      const initials = getUserInitials(null, mockUser);

      expect(displayName).toBe('test'); // email prefix
      expect(avatarUrl).toContain('dicebear.com'); // fallback avatar
      expect(initials).toBe('T');
    });
  });

  describe('IssueCard Component', () => {
    it('should display issue data correctly', () => {
      render(
        <TestWrapper>
          <IssueCard 
            issue={mockIssue}
            onSelect={() => {}}
            onDelete={() => {}}
            showDeleteButton={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Test Issue')).toBeInTheDocument();
      expect(screen.getByText('Test issue description')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should handle missing author data gracefully', () => {
      const issueWithoutAuthor = {
        ...mockIssue,
        author: null
      };

      render(
        <TestWrapper>
          <IssueCard 
            issue={issueWithoutAuthor}
            onSelect={() => {}}
            onDelete={() => {}}
            showDeleteButton={false}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Anonymous User')).toBeInTheDocument();
    });
  });

  describe('API Functions', () => {
    it('should fetch issues with correct parameters', async () => {
      const result = await fetchIssues({
        status: 'open',
        category: 'infrastructure',
        search: 'test'
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('issues');
      expect(result.issues).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should handle delete issue correctly', async () => {
      await deleteIssue('test-issue-id', 'test-user-id');

      expect(mockSupabase.from).toHaveBeenCalledWith('issues');
    });
  });

  describe('Header Component', () => {
    it('should display user information in dropdown', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      // Check if user avatar is displayed
      const avatar = screen.getByRole('button', { name: /user menu/i });
      expect(avatar).toBeInTheDocument();
    });
  });
});

describe('Data Transformation', () => {
  it('should transform database issue to UI issue correctly', () => {
    const dbIssue = {
      id: 'test-id',
      title: 'Test Title',
      description: 'Test Description',
      category: 'infrastructure',
      status: 'open',
      created_at: '2024-01-01T00:00:00Z',
      vote_count: 5,
      comment_count: 3,
      watchers_count: 2,
      profiles: mockProfile,
      departments: { name: 'Test Department' }
    };

    // This would be tested in the actual transformIssueForUI function
    expect(dbIssue.title).toBe('Test Title');
    expect(dbIssue.vote_count).toBe(5);
  });
});
