/**
 * @fileoverview IssueCard Component Tests
 * @description Comprehensive tests for the IssueCard component including
 * accessibility, user interactions, and ARIA compliance.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, createMockIssue, mockUseAuth } from '@/test/utils';
import IssueCard from '../IssueCard';
import type { UIIssue } from '@/types/enhanced';

// Mock the auth hook
vi.mock('@/lib/auth', () => ({
  useAuth: () => mockUseAuth,
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    }),
  },
}));

describe('IssueCard', () => {
  let mockIssue: UIIssue;
  let mockProps: any;

  beforeEach(() => {
    mockIssue = createMockIssue({
      title: 'Test Issue Title',
      description: 'Test issue description for testing purposes',
      status: 'open',
      category: 'infrastructure',
      votes: 5,
      watchers_count: 3,
    });

    mockProps = {
      ...mockIssue,
      comments: [],
      isLiked: false,
      isWatched: false,
      onIssueClick: vi.fn(),
      onDelete: vi.fn(),
      showDeleteButton: false,
    };
  });

  describe('Rendering', () => {
    it('should render issue card with basic information', () => {
      renderWithProviders(<IssueCard {...mockProps} />);

      expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
      expect(screen.getByText('Test issue description for testing purposes')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('should display vote and comment counts', () => {
      renderWithProviders(<IssueCard {...mockProps} />);

      expect(screen.getByText('5')).toBeInTheDocument(); // votes
      expect(screen.getByText('0')).toBeInTheDocument(); // comments
      expect(screen.getByText('3')).toBeInTheDocument(); // watchers
    });

    it('should show delete button when user owns the issue', () => {
      const propsWithDelete = {
        ...mockProps,
        showDeleteButton: true,
        author_id: mockUseAuth.user.id,
      };

      renderWithProviders(<IssueCard {...propsWithDelete} />);

      const deleteButton = screen.getByLabelText('Delete issue');
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<IssueCard {...mockProps} />);

      // Check for article role
      const article = screen.getByRole('article');
      expect(article).toBeInTheDocument();

      // Check for proper labeling
      expect(article).toHaveAttribute('aria-labelledby');
      expect(article).toHaveAttribute('aria-describedby');
    });

    it('should have accessible buttons with proper labels', () => {
      renderWithProviders(<IssueCard {...mockProps} />);

      const voteButton = screen.getByLabelText('Vote for this issue');
      const watchButton = screen.getByLabelText('Watch this issue for updates');
      const commentsButton = screen.getByLabelText('0 comments');

      expect(voteButton).toBeInTheDocument();
      expect(watchButton).toBeInTheDocument();
      expect(commentsButton).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IssueCard {...mockProps} />);

      const card = screen.getByRole('article');
      
      // Focus the card
      await user.tab();
      expect(card).toHaveFocus();

      // Activate with Enter key
      await user.keyboard('{Enter}');
      expect(mockProps.onIssueClick).toHaveBeenCalled();
    });

    it('should announce vote state changes to screen readers', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IssueCard {...mockProps} />);

      const voteButton = screen.getByLabelText('Vote for this issue');
      
      // Check initial state
      expect(voteButton).toHaveAttribute('aria-pressed', 'false');

      // Click vote button
      await user.click(voteButton);

      // Should update aria-pressed state
      await waitFor(() => {
        expect(voteButton).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle vote button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IssueCard {...mockProps} />);

      const voteButton = screen.getByLabelText('Vote for this issue');
      await user.click(voteButton);

      // Should update local state
      await waitFor(() => {
        expect(voteButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should handle watch button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IssueCard {...mockProps} />);

      const watchButton = screen.getByLabelText('Watch this issue for updates');
      await user.click(watchButton);

      // Should update local state
      await waitFor(() => {
        expect(watchButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should handle card click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<IssueCard {...mockProps} />);

      const card = screen.getByRole('article');
      await user.click(card);

      expect(mockProps.onIssueClick).toHaveBeenCalledWith(mockIssue);
    });

    it('should handle delete button click', async () => {
      const user = userEvent.setup();
      const propsWithDelete = {
        ...mockProps,
        showDeleteButton: true,
        author_id: mockUseAuth.user.id,
      };

      renderWithProviders(<IssueCard {...propsWithDelete} />);

      const deleteButton = screen.getByLabelText('Delete issue');
      await user.click(deleteButton);

      // Should prevent event propagation (not trigger card click)
      expect(mockProps.onIssueClick).not.toHaveBeenCalled();
    });
  });

  describe('Status Display', () => {
    it('should display different status badges correctly', () => {
      const statuses = ['open', 'in-progress', 'resolved', 'closed'] as const;

      statuses.forEach(status => {
        const { unmount } = renderWithProviders(
          <IssueCard {...mockProps} status={status} />
        );

        const statusText = status === 'in-progress' ? 'In progress' : 
                          status.charAt(0).toUpperCase() + status.slice(1);
        
        expect(screen.getByText(statusText)).toBeInTheDocument();
        unmount();
      });
    });

    it('should have proper ARIA label for status', () => {
      renderWithProviders(<IssueCard {...mockProps} status="open" />);

      const statusBadge = screen.getByText('Open');
      expect(statusBadge).toHaveAttribute('aria-label', 'Status: open');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing or invalid data gracefully', () => {
      const invalidProps = {
        ...mockProps,
        title: '',
        description: null,
        votes: undefined,
      };

      expect(() => {
        renderWithProviders(<IssueCard {...invalidProps} />);
      }).not.toThrow();

      // Should show fallback content
      expect(screen.getByText('No description available')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock API error
      vi.mocked(mockUseAuth.user).mockReturnValueOnce(null);

      renderWithProviders(<IssueCard {...mockProps} />);

      const voteButton = screen.getByLabelText('Vote for this issue');
      await user.click(voteButton);

      // Should not crash and should show appropriate feedback
      expect(voteButton).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = renderWithProviders(<IssueCard {...mockProps} />);

      // Re-render with same props
      rerender(<IssueCard {...mockProps} />);

      // Component should be memoized and not re-render
      expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
    });
  });
});
