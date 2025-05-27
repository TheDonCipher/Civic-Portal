/**
 * Enhanced type definitions for the Civic Portal
 * Provides strict typing for better type safety and developer experience
 */

import { Database } from './supabase';

// ✅ Database table types with proper null handling
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// ✅ Core entity types
export type Issue = Tables<'issues'>;
export type Profile = Tables<'profiles'>;
export type Comment = Tables<'comments'>;
export type Department = Tables<'departments'>;
export type Notification = Tables<'notifications'>;
export type Solution = Tables<'solutions'>;
export type IssueVote = Tables<'issue_votes'>;
export type IssueWatcher = Tables<'issue_watchers'>;
export type Update = Tables<'updates'>;

// ✅ Enhanced Issue type for UI components with safe date handling
export interface UIIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  votes: number;
  vote_count: number; // From database schema
  comment_count: number; // From database schema
  view_count: number; // From database schema
  comments: Array<{
    id: number;
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    date: string; // Always converted to string for UI
  }>;
  date: string; // Always a string for UI consistency - converted from created_at
  author: {
    name: string;
    avatar: string;
  };
  author_id: string;
  thumbnail: string;
  location?: string;
  constituency?: string;
  watchers?: number;
  watchers_count?: number;
  created_at: string; // Always required for consistency
  updated_at: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
  first_response_at?: string | null;
  assigned_to?: string | null;
  department_id?: string | null;
  department?: {
    id: string;
    name: string;
    description?: string;
  } | null;
  tags?: string[];
  attachments?: any[];
  metadata?: any;
}

// ✅ Safe UI types that handle null dates from database
export interface UIComment {
  id: string;
  content: string;
  author_id: string;
  issue_id: string;
  is_official: boolean;
  parent_id?: string | null;
  attachments?: any[];
  created_at: string; // Always converted to string
  updated_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
}

export interface UISolution {
  id: string;
  title: string;
  description: string;
  implementation_plan?: string;
  estimated_cost?: number;
  estimated_timeline?: string;
  vote_count: number;
  is_official: boolean;
  status: 'proposed' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  created_at: string; // Always converted to string
  updated_at: string;
  author_id: string;
  issue_id: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
  user_voted?: boolean;
  user_vote_type?: 'up' | 'down' | null;
}

export interface UIUpdate {
  id: string;
  title: string;
  content: string;
  status_change?: string | null;
  is_official: boolean;
  attachments?: any[];
  created_at: string; // Always converted to string
  updated_at: string;
  author_id: string;
  issue_id: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
}

export interface UIVote {
  id: string;
  user_id: string;
  issue_id?: string | null;
  solution_id?: string | null;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface UINotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'issue_update' | 'comment' | 'solution' | 'verification' | 'system';
  is_read: boolean;
  related_issue_id?: string | null;
  related_comment_id?: string | null;
  metadata?: any;
  created_at: string;
}

// ✅ Enhanced types with relationships
export interface IssueWithDetails extends Issue {
  profiles?: Profile | null;
  departments?: Department | null;
  comments?: Comment[];
  solutions?: Solution[];
  updates?: Update[];
  votes?: any[]; // Using unified votes table
  watchers?: any[]; // Using unified watchers table
  _count?: {
    comments: number;
    votes: number;
    watchers: number;
    solutions: number;
  };
}

export interface ProfileWithDepartment extends Profile {
  departments?: Department | null;
}

export interface CommentWithAuthor extends Comment {
  profiles?: Profile | null;
}

export interface SolutionWithAuthor extends Solution {
  profiles?: Profile | null;
  votes?: any[]; // Using unified votes table
  user_vote?: any | null;
}

export interface UpdateWithAuthor extends Update {
  profiles?: Profile | null;
}

export interface DepartmentWithStats extends Department {
  _stats?: {
    total_issues: number;
    open_issues: number;
    in_progress_issues: number;
    resolved_issues: number;
    closed_issues: number;
    avg_resolution_time?: number;
    total_officials: number;
  };
}

// ✅ Form data types
export interface CreateIssueData {
  title: string;
  description: string;
  category: string;
  location?: string;
  constituency?: string;
}

export interface CreateCommentData {
  content: string;
  issue_id: string;
}

export interface CreateSolutionData {
  title: string;
  description: string;
  estimated_cost: number;
  issue_id: string;
}

export interface UpdateProfileData {
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

// ✅ Filter and pagination types
export interface IssueFilters {
  category?: string;
  status?: string;
  department_id?: string;
  constituency?: string;
  search?: string;
  author_id?: string;
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  filters?: IssueFilters;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ✅ API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string | null;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// ✅ Authentication types
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: AuthUser;
}

// ✅ User roles and permissions
export type UserRole = 'citizen' | 'official' | 'admin';

export interface UserPermissions {
  canCreateIssues: boolean;
  canEditIssues: boolean;
  canDeleteIssues: boolean;
  canManageUsers: boolean;
  canManageDepartments: boolean;
  canViewAnalytics: boolean;
  canModerateContent: boolean;
}

// ✅ Dashboard statistics types
export interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  totalUsers: number;
  issuesByCategory: Array<{
    category: string;
    count: number;
  }>;
  issuesByStatus: Array<{
    status: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'issue_created' | 'issue_updated' | 'comment_added' | 'solution_proposed';
    title: string;
    created_at: string;
    author: {
      username: string;
      avatar_url?: string;
    };
  }>;
}

// ✅ Real-time subscription types
export interface RealtimeOptions {
  filter?: IssueFilters;
  onUpdate?: (payload: any) => void;
  onError?: (error: Error) => void;
}

// ✅ Notification types
export type NotificationType =
  | 'issue_created'
  | 'issue_updated'
  | 'issue_resolved'
  | 'comment_added'
  | 'solution_proposed'
  | 'vote_received'
  | 'mention'
  | 'system';

export interface NotificationWithIssue extends Notification {
  issues?: Issue | null;
}

// ✅ Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface ErrorProps extends BaseComponentProps {
  error: Error | string;
  onRetry?: () => void;
  retryLabel?: string;
}

// ✅ Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T = any> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// ✅ Theme and UI types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
}

// ✅ Demo mode types
export interface DemoConfig {
  enabled: boolean;
  mockData: {
    issues: Issue[];
    users: Profile[];
    comments: Comment[];
    solutions: Solution[];
  };
}

// ✅ Search and filtering types
export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  filters: Record<string, any>;
}

export interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ✅ File upload types
export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

// ✅ Data transformation utilities
export interface DataTransformers {
  /**
   * Converts database Issue to UI-safe UIIssue
   */
  toUIIssue: (issue: Issue & { profiles?: Profile | null }) => UIIssue;

  /**
   * Converts database Comment to UI-safe UIComment
   */
  toUIComment: (comment: Comment & { profiles?: Profile | null }) => UIComment;

  /**
   * Converts database Solution to UI-safe UISolution
   */
  toUISolution: (solution: Solution & { profiles?: Profile | null }) => UISolution;

  /**
   * Converts database Update to UI-safe UIUpdate
   */
  toUIUpdate: (update: Update & { profiles?: Profile | null }) => UIUpdate;
}

// ✅ Export utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ✅ Safe type guards for null checking
export type NonNullable<T> = T extends null | undefined ? never : T;
export type SafeString = string; // Always guaranteed to be a string, never null
export type SafeDate = string; // Always guaranteed to be a valid date string

// ✅ Event handler types
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// ✅ Hook return types
export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseFormReturn<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
  handleSubmit: (onSubmit: (data: T) => Promise<void>) => (e: React.FormEvent) => Promise<void>;
  setValue: (field: keyof T, value: any) => void;
  reset: () => void;
}
