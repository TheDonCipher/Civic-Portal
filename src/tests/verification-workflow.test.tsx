import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '@/providers/AuthProvider';
import AdminPage from '@/components/admin/AdminPage';
import StakeholderDashboard from '@/components/stakeholder/StakeholderDashboard';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    channel: vi.fn(() => ({
      on: vi.fn(() => ({ subscribe: vi.fn() })),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  },
}));

// Mock useAuth hook
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    profile: {
      id: 'test-user-id',
      role: 'admin',
      full_name: 'Test Admin',
      verification_status: 'verified',
    },
    isLoading: false,
  }),
}));

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('Official Verification Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Verification Process', () => {
    it('should display pending officials for verification', async () => {
      const mockProfiles = [
        {
          id: 'official-1',
          username: 'official1',
          full_name: 'John Official',
          role: 'official',
          verification_status: 'pending',
          department_id: 'dept-1',
          created_at: '2024-01-01T00:00:00Z',
          department: { id: 'dept-1', name: 'Health' },
        },
      ];

      const mockSupabaseResponse = {
        data: mockProfiles,
        error: null,
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue(mockSupabaseResponse),
        }),
      });

      render(
        <TestWrapper>
          <AdminPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Official')).toBeInTheDocument();
        expect(screen.getByText('pending')).toBeInTheDocument();
      });
    });

    it('should allow admin to verify an official', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ error: null });
      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'official-1',
                    username: 'official1',
                    full_name: 'John Official',
                    role: 'official',
                    verification_status: 'pending',
                    department_id: 'dept-1',
                    created_at: '2024-01-01T00:00:00Z',
                    department: { id: 'dept-1', name: 'Health' },
                  },
                ],
                error: null,
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'notifications') {
          return {
            insert: mockInsert,
          };
        }
        if (table === 'audit_logs') {
          return {
            insert: mockInsert,
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      });

      render(
        <TestWrapper>
          <AdminPage />
        </TestWrapper>
      );

      // Wait for the component to load and find verify button
      await waitFor(() => {
        const verifyButton = screen.getByTitle('Verify user');
        expect(verifyButton).toBeInTheDocument();
        fireEvent.click(verifyButton);
      });

      // Verify that the verification dialog appears and confirm
      await waitFor(() => {
        const confirmButton = screen.getByText('Verify');
        expect(confirmButton).toBeInTheDocument();
        fireEvent.click(confirmButton);
      });

      // Check that the update was called
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('Stakeholder Dashboard Access Control', () => {
    it('should block unverified officials from accessing dashboard', () => {
      // Mock unverified official
      vi.mocked(require('@/lib/auth').useAuth).mockReturnValue({
        user: { id: 'official-1', email: 'official@example.com' },
        profile: {
          id: 'official-1',
          role: 'official',
          full_name: 'John Official',
          verification_status: 'pending',
          department_id: 'dept-1',
        },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <StakeholderDashboard />
        </TestWrapper>
      );

      expect(
        screen.getByText('Account Verification Pending')
      ).toBeInTheDocument();
      expect(screen.getByText(/currently under review/)).toBeInTheDocument();
    });

    it('should allow verified officials to access dashboard', () => {
      // Mock verified official
      vi.mocked(require('@/lib/auth').useAuth).mockReturnValue({
        user: { id: 'official-1', email: 'official@example.com' },
        profile: {
          id: 'official-1',
          role: 'official',
          full_name: 'John Official',
          verification_status: 'verified',
          department_id: 'dept-1',
        },
        isLoading: false,
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      render(
        <TestWrapper>
          <StakeholderDashboard />
        </TestWrapper>
      );

      // Should not show verification pending message
      expect(
        screen.queryByText('Account Verification Pending')
      ).not.toBeInTheDocument();
    });

    it('should show rejection message for rejected officials', () => {
      // Mock rejected official
      vi.mocked(require('@/lib/auth').useAuth).mockReturnValue({
        user: { id: 'official-1', email: 'official@example.com' },
        profile: {
          id: 'official-1',
          role: 'official',
          full_name: 'John Official',
          verification_status: 'rejected',
          verification_notes: 'Invalid credentials provided',
          department_id: 'dept-1',
        },
        isLoading: false,
      });

      render(
        <TestWrapper>
          <StakeholderDashboard />
        </TestWrapper>
      );

      expect(
        screen.getByText('Account Verification Rejected')
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Invalid credentials provided/)
      ).toBeInTheDocument();
    });
  });

  describe('Notification System', () => {
    it('should display notifications correctly', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'verification_approved',
          title: 'Account Verified! 🎉',
          message: 'Your account has been verified',
          read: false,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockNotifications,
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      });

      render(
        <TestWrapper>
          <NotificationBell />
        </TestWrapper>
      );

      // Click notification bell
      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      await waitFor(() => {
        expect(screen.getByText('Account Verified! 🎉')).toBeInTheDocument();
        expect(
          screen.getByText('Your account has been verified')
        ).toBeInTheDocument();
      });
    });

    it('should mark notifications as read when clicked', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({ error: null });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'notif-1',
                  type: 'verification_approved',
                  title: 'Account Verified! 🎉',
                  message: 'Your account has been verified',
                  read: false,
                  created_at: '2024-01-01T00:00:00Z',
                },
              ],
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(mockUpdate),
        }),
      });

      render(
        <TestWrapper>
          <NotificationBell />
        </TestWrapper>
      );

      // Click notification bell
      const bellButton = screen.getByRole('button');
      fireEvent.click(bellButton);

      await waitFor(() => {
        const notification = screen.getByText('Account Verified! 🎉');
        fireEvent.click(notification);
      });

      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});
