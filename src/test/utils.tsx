/**
 * Test Utilities
 * Custom render functions and test helpers
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/AuthProvider';
import { DemoProvider } from '@/providers/DemoProvider';
import { Toaster } from '@/components/ui/toaster';

// Mock user data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
    role: 'citizen',
  },
};

export const mockProfile = {
  id: 'test-user-id',
  full_name: 'Test User',
  username: 'testuser',
  role: 'citizen' as const,
  constituency: 'Test Constituency',
  department_id: null,
  avatar_url: null,
  banner_url: null,
  bio: null,
  is_verified: false,
  verification_status: 'pending' as const,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockIssue = {
  id: 'test-issue-id',
  title: 'Test Issue',
  description: 'Test issue description',
  category: 'infrastructure',
  status: 'open',
  location: 'Test Location',
  constituency: 'Test Constituency',
  author_id: 'test-user-id',
  department_id: null,
  votes: 5,
  watchers_count: 3,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  author_name: 'Test User',
  author_avatar: null,
  thumbnail: null,
  profiles: mockProfile,
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  user?: typeof mockUser | null;
  profile?: typeof mockProfile | null;
  isDemoMode?: boolean;
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    user = mockUser,
    profile = mockProfile,
    isDemoMode = false,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <DemoProvider initialDemoMode={isDemoMode}>
              {children}
              <Toaster />
            </DemoProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Simplified render for components that don't need full provider setup
export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'] }: { initialEntries?: string[] } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return render(ui, { wrapper: Wrapper });
}

// Mock implementations for common hooks
export const mockUseAuth = {
  user: mockUser,
  profile: mockProfile,
  loading: false,
  signIn: vi.fn().mockResolvedValue({ user: mockUser, error: null }),
  signUp: vi.fn().mockResolvedValue({ user: mockUser, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  updateProfile: vi.fn().mockResolvedValue({ error: null }),
};

export const mockUseDemoMode = {
  isDemoMode: false,
  toggleDemoMode: vi.fn(),
  setDemoMode: vi.fn(),
};

// Test data generators
export function createMockIssue(overrides: Partial<typeof mockIssue> = {}) {
  return {
    ...mockIssue,
    ...overrides,
    id: overrides.id || `issue-${Math.random().toString(36).substr(2, 9)}`,
  };
}

export function createMockUser(overrides: Partial<typeof mockUser> = {}) {
  return {
    ...mockUser,
    ...overrides,
    id: overrides.id || `user-${Math.random().toString(36).substr(2, 9)}`,
  };
}

export function createMockProfile(overrides: Partial<typeof mockProfile> = {}) {
  return {
    ...mockProfile,
    ...overrides,
    id: overrides.id || `profile-${Math.random().toString(36).substr(2, 9)}`,
  };
}

// Async test helpers
export function waitForLoadingToFinish() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function waitForNextTick() {
  return new Promise((resolve) => process.nextTick(resolve));
}

// Form testing helpers
export function fillForm(form: HTMLFormElement, data: Record<string, string>) {
  Object.entries(data).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

// Accessibility testing helpers
export function getByRole(container: HTMLElement, role: string, options?: any) {
  return (
    container.querySelector(`[role="${role}"]`) ||
    container.querySelector(role) ||
    null
  );
}

export function getAllByRole(container: HTMLElement, role: string) {
  return Array.from(container.querySelectorAll(`[role="${role}"]`));
}

// Error boundary testing
export function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// Mock intersection observer for testing
export function mockIntersectionObserver() {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
}

// Notification test data generators
export function createMockNotification(overrides: any = {}) {
  return {
    id: `notification-${Math.random().toString(36).substr(2, 9)}`,
    user_id: 'test-user-id',
    type: 'general',
    title: 'Test Notification',
    message: 'Test notification message',
    read: false,
    read_at: null,
    created_at: new Date().toISOString(),
    data: {},
    related_issue_id: null,
    related_comment_id: null,
    related_solution_id: null,
    action_url: null,
    priority: 'normal',
    expires_at: null,
    ...overrides,
  };
}

export function createMockComment(overrides: any = {}) {
  return {
    id: `comment-${Math.random().toString(36).substr(2, 9)}`,
    issue_id: 'test-issue-id',
    author_id: 'test-user-id',
    content: 'Test comment content',
    is_official: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockSolution(overrides: any = {}) {
  return {
    id: `solution-${Math.random().toString(36).substr(2, 9)}`,
    issue_id: 'test-issue-id',
    author_id: 'test-user-id',
    title: 'Test Solution',
    description: 'Test solution description',
    is_official: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockDepartment(overrides: any = {}) {
  return {
    id: `dept-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Department',
    description: 'Test department description',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

// Test users with different roles
export const mockCitizen = createMockUser({
  id: 'citizen-user-id',
  email: 'citizen@example.com',
  user_metadata: { full_name: 'Test Citizen', role: 'citizen' },
});

export const mockStakeholder = createMockUser({
  id: 'stakeholder-user-id',
  email: 'stakeholder@example.com',
  user_metadata: { full_name: 'Test Stakeholder', role: 'official' },
});

export const mockAdmin = createMockUser({
  id: 'admin-user-id',
  email: 'admin@example.com',
  user_metadata: { full_name: 'Test Admin', role: 'admin' },
});

export const mockCitizenProfile = createMockProfile({
  id: 'citizen-user-id',
  full_name: 'Test Citizen',
  role: 'citizen',
});

export const mockStakeholderProfile = createMockProfile({
  id: 'stakeholder-user-id',
  full_name: 'Test Stakeholder',
  role: 'official',
  department_id: 'test-dept-id',
});

export const mockAdminProfile = createMockProfile({
  id: 'admin-user-id',
  full_name: 'Test Admin',
  role: 'admin',
});

// Re-export everything from testing library
export * from '@testing-library/react';
export * from '@testing-library/user-event';
export { vi, expect } from 'vitest';
