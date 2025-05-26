import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AdminPage from './AdminPage';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// Mock the auth hook
vi.mock('@/lib/auth');
vi.mock('@/lib/supabase');

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock MainLayout
vi.mock('@/components/layout/MainLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock PageTitle
vi.mock('@/components/common/PageTitle', () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));

const mockDepartments = [
  {
    id: '1',
    name: 'Finance',
    description: 'Financial management and economic policy',
    category: 'Economic Affairs',
  },
  {
    id: '2',
    name: 'Health',
    description: 'Public health services and medical care',
    category: 'Social Services',
  },
];

const mockProfiles = [
  {
    id: '1',
    username: 'admin_user',
    full_name: 'Admin User',
    role: 'admin',
    constituency: 'Central',
    department_id: '1',
    verification_status: 'verified',
    created_at: '2024-01-01T00:00:00Z',
    department: { id: '1', name: 'Finance' },
  },
  {
    id: '2',
    username: 'citizen_user',
    full_name: 'Citizen User',
    role: 'citizen',
    constituency: 'North',
    department_id: null,
    verification_status: 'verified',
    created_at: '2024-01-02T00:00:00Z',
    department: null,
  },
];

describe('AdminPage', () => {
  beforeEach(() => {
    // Mock the auth hook to return admin user
    (useAuth as any).mockReturnValue({
      user: { id: '1', email: 'admin@example.com' },
      profile: { id: '1', role: 'admin' },
    });

    // Mock Supabase queries
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            order: () => ({
              data: mockProfiles,
              error: null,
            }),
          }),
        };
      }
      if (table === 'departments') {
        return {
          select: () => ({
            order: () => ({
              data: mockDepartments,
              error: null,
            }),
          }),
          update: () => ({
            eq: () => ({
              data: null,
              error: null,
            }),
          }),
        };
      }
      if (table === 'issues') {
        return {
          select: () => ({
            order: () => ({
              data: [],
              error: null,
            }),
          }),
        };
      }
      return {
        select: () => ({ data: [], error: null }),
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders admin page with departments tab', async () => {
    render(<AdminPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    // Check if departments tab exists
    const departmentsTab = screen.getByText('Departments');
    expect(departmentsTab).toBeInTheDocument();
  });

  test('displays departments in card layout', async () => {
    render(<AdminPage />);
    
    // Click on departments tab
    const departmentsTab = screen.getByText('Departments');
    fireEvent.click(departmentsTab);

    await waitFor(() => {
      expect(screen.getByText('Finance')).toBeInTheDocument();
      expect(screen.getByText('Health')).toBeInTheDocument();
    });
  });

  test('opens edit dialog when edit button is clicked', async () => {
    render(<AdminPage />);
    
    // Click on departments tab
    const departmentsTab = screen.getByText('Departments');
    fireEvent.click(departmentsTab);

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('title') !== 'Department deletion is not allowed to maintain data integrity'
      );
      
      if (editButton) {
        fireEvent.click(editButton);
      }
    });

    // Check if edit dialog opens
    await waitFor(() => {
      expect(screen.getByText('Edit Department')).toBeInTheDocument();
    });
  });

  test('validates department form inputs', async () => {
    render(<AdminPage />);
    
    // Navigate to departments and open edit dialog
    const departmentsTab = screen.getByText('Departments');
    fireEvent.click(departmentsTab);

    await waitFor(() => {
      const editButtons = screen.getAllByRole('button');
      const editButton = editButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('title') !== 'Department deletion is not allowed to maintain data integrity'
      );
      
      if (editButton) {
        fireEvent.click(editButton);
      }
    });

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Department Name/);
      
      // Clear the input to trigger validation
      fireEvent.change(nameInput, { target: { value: '' } });
      
      // Try to save
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
    });

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Department name is required')).toBeInTheDocument();
    });
  });

  test('shows access denied for non-admin users', () => {
    // Mock non-admin user
    (useAuth as any).mockReturnValue({
      user: { id: '2', email: 'citizen@example.com' },
      profile: { id: '2', role: 'citizen' },
    });

    render(<AdminPage />);
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText("You don't have permission to access the admin panel.")).toBeInTheDocument();
  });
});
