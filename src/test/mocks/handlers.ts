/**
 * MSW Request Handlers
 * Mock API responses for testing
 */

import { http, HttpResponse } from 'msw';

// Mock data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
    role: 'citizen',
  },
};

const mockProfile = {
  id: 'test-user-id',
  full_name: 'Test User',
  username: 'testuser',
  role: 'citizen',
  constituency: 'Test Constituency',
  department_id: null,
  avatar_url: null,
  bio: null,
  is_verified: false,
  verification_status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockIssue = {
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
  profiles: mockProfile,
};

const mockComment = {
  id: 'test-comment-id',
  content: 'Test comment',
  author_id: 'test-user-id',
  issue_id: 'test-issue-id',
  created_at: '2024-01-01T00:00:00Z',
  profiles: mockProfile,
};

export const handlers = [
  // Auth endpoints
  http.post('*/auth/v1/signup', () => {
    return HttpResponse.json({
      user: mockUser,
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      },
    });
  }),

  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      user: mockUser,
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      },
    });
  }),

  http.get('*/auth/v1/user', () => {
    return HttpResponse.json({ user: mockUser });
  }),

  http.post('*/auth/v1/logout', () => {
    return HttpResponse.json({});
  }),

  // Supabase REST API endpoints
  http.get('*/rest/v1/profiles', () => {
    return HttpResponse.json([mockProfile]);
  }),

  http.get('*/rest/v1/profiles*', () => {
    return HttpResponse.json([mockProfile]);
  }),

  http.post('*/rest/v1/profiles', () => {
    return HttpResponse.json(mockProfile);
  }),

  http.patch('*/rest/v1/profiles*', () => {
    return HttpResponse.json(mockProfile);
  }),

  http.get('*/rest/v1/issues', () => {
    return HttpResponse.json([mockIssue]);
  }),

  http.get('*/rest/v1/issues*', () => {
    return HttpResponse.json([mockIssue]);
  }),

  http.post('*/rest/v1/issues', () => {
    return HttpResponse.json(mockIssue);
  }),

  http.patch('*/rest/v1/issues*', () => {
    return HttpResponse.json(mockIssue);
  }),

  http.delete('*/rest/v1/issues*', () => {
    return HttpResponse.json({});
  }),

  http.get('*/rest/v1/comments', () => {
    return HttpResponse.json([mockComment]);
  }),

  http.get('*/rest/v1/comments*', () => {
    return HttpResponse.json([mockComment]);
  }),

  http.post('*/rest/v1/comments', () => {
    return HttpResponse.json(mockComment);
  }),

  http.get('*/rest/v1/departments', () => {
    return HttpResponse.json([
      {
        id: 'dept-1',
        name: 'Test Department',
        description: 'Test department description',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),

  http.get('*/rest/v1/solutions', () => {
    return HttpResponse.json([
      {
        id: 'solution-1',
        title: 'Test Solution',
        description: 'Test solution description',
        issue_id: 'test-issue-id',
        proposed_by: 'test-user-id',
        status: 'pending',
        estimated_cost: 1000,
        created_at: '2024-01-01T00:00:00Z',
        profiles: mockProfile,
      },
    ]);
  }),

  http.post('*/rest/v1/solutions', () => {
    return HttpResponse.json({
      id: 'solution-1',
      title: 'Test Solution',
      description: 'Test solution description',
      issue_id: 'test-issue-id',
      proposed_by: 'test-user-id',
      status: 'pending',
      estimated_cost: 1000,
      created_at: '2024-01-01T00:00:00Z',
    });
  }),

  // Storage endpoints
  http.post('*/storage/v1/object/*', () => {
    return HttpResponse.json({
      Key: 'mock-file-key',
      ETag: 'mock-etag',
    });
  }),

  http.delete('*/storage/v1/object/*', () => {
    return HttpResponse.json({});
  }),

  // RPC endpoints
  http.post('*/rest/v1/rpc/get_issues_stats', () => {
    return HttpResponse.json({
      total: 10,
      open: 5,
      in_progress: 3,
      resolved: 2,
      closed: 0,
    });
  }),

  http.post('*/rest/v1/rpc/get_monthly_issue_stats', () => {
    return HttpResponse.json([
      {
        month: '2024-01',
        created: 5,
        resolved: 3,
        response_time: 2.5,
      },
    ]);
  }),

  // Realtime endpoints
  http.get('*/realtime/v1/websocket', () => {
    return HttpResponse.json({});
  }),

  // Fallback for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }),
];
