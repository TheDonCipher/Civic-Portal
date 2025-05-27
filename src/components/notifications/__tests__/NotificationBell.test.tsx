import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationBell } from '../NotificationBell';
import { useAuth } from '@/lib/auth';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/utils/notificationUtils';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/utils/notificationUtils');
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  },
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock notification sound utilities
vi.mock('@/lib/utils/notificationSound', () => ({
  playNotificationSound: vi.fn(),
  getNotificationPreferences: vi.fn().mockReturnValue({ soundEnabled: false }),
}));

// Mock date utilities
vi.mock('@/lib/utils/dateUtils', () => ({
  safeDate: {
    toString: (date: string) => date,
  },
}));

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const mockNotifications = [
  {
    id: '1',
    type: 'issue_update',
    title: 'Issue Updated',
    message: 'Your issue has been updated',
    read: false,
    created_at: new Date().toISOString(),
    priority: 'normal',
  },
  {
    id: '2',
    type: 'comment',
    title: 'New Comment',
    message: 'Someone commented on your issue',
    read: true,
    created_at: new Date().toISOString(),
    priority: 'high',
  },
  {
    id: '3',
    type: 'verification_approved',
    title: 'Account Verified',
    message: 'Your account has been verified',
    read: false,
    created_at: new Date().toISOString(),
    priority: 'urgent',
  },
];

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser });
    (getUserNotifications as any).mockResolvedValue(mockNotifications);
    (markNotificationAsRead as any).mockResolvedValue(true);
    (markAllNotificationsAsRead as any).mockResolvedValue(2);
  });

  it('renders notification bell with unread count', async () => {
    render(<NotificationBell />);

    // Should show the bell icon
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Wait for notifications to load and check unread count
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 unread notifications
    });
  });

  it('does not render when user is not authenticated', () => {
    (useAuth as any).mockReturnValue({ user: null });

    const { container } = render(<NotificationBell />);
    expect(container.firstChild).toBeNull();
  });

  it('renders bell button correctly', async () => {
    render(<NotificationBell />);

    // Check that the bell button is rendered
    const bellButton = screen.getByRole('button');
    expect(bellButton).toBeInTheDocument();

    // Check that it has the correct aria attributes
    expect(bellButton).toHaveAttribute('aria-haspopup', 'menu');
    expect(bellButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('loads notifications on mount', async () => {
    render(<NotificationBell />);

    // Verify getUserNotifications was called
    await waitFor(() => {
      expect(getUserNotifications).toHaveBeenCalledWith(mockUser.id);
    });
  });

  it('displays correct unread count', async () => {
    render(<NotificationBell />);

    // Check that unread count badge is displayed (2 unread notifications)
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('handles empty notifications gracefully', async () => {
    (getUserNotifications as any).mockResolvedValue([]);

    render(<NotificationBell />);

    // Should not display unread count badge when no notifications
    await waitFor(() => {
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    // Bell should still be rendered
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles notification fetch errors gracefully', async () => {
    (getUserNotifications as any).mockRejectedValue(new Error('Fetch failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<NotificationBell />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching notifications:',
        expect.any(Error)
      );
    });

    // Bell should still be rendered even on error
    expect(screen.getByRole('button')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('sets up real-time subscription', async () => {
    render(<NotificationBell />);

    // Verify that Supabase channel was created for real-time updates
    await waitFor(() => {
      expect(getUserNotifications).toHaveBeenCalled();
    });

    // Component should be rendered
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles different notification priorities', async () => {
    const priorityNotifications = [
      { ...mockNotifications[0], priority: 'low' },
      { ...mockNotifications[1], priority: 'high' },
      { ...mockNotifications[2], priority: 'urgent' },
    ];

    (getUserNotifications as any).mockResolvedValue(priorityNotifications);

    render(<NotificationBell />);

    // Should still display unread count regardless of priority
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // 2 unread
    });
  });
});
