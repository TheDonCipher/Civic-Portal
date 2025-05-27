/**
 * Test Setup Configuration
 * Global test utilities and mocks for Civic Portal
 */

import '@testing-library/jest-dom';
import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Extend Vitest's expect with jest-dom matchers
expect.extend({});

// Global test setup
beforeAll(() => {
  // Start MSW server for API mocking
  server.listen({ onUnhandledRequest: 'error' });

  // Mock environment variables
  vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost:54321');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  vi.stubEnv('NODE_ENV', 'test');
});

// Clean up after each test
afterEach(() => {
  // Clean up DOM
  cleanup();

  // Reset MSW handlers
  server.resetHandlers();

  // Clear all mocks
  vi.clearAllMocks();

  // Reset modules
  vi.resetModules();
});

// Global test teardown
afterAll(() => {
  // Stop MSW server
  server.close();

  // Restore environment
  vi.unstubAllEnvs();
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'mocked-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = vi.fn();
}

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  // Suppress known React warnings in tests
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is no longer supported') ||
     message.includes('Warning: validateDOMNesting') ||
     message.includes('Warning: Each child in a list should have a unique "key" prop'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args: any[]) => {
  // Suppress known warnings in tests
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: componentWillReceiveProps') ||
     message.includes('Warning: componentWillMount'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

// Mock Supabase client
vi.mock('@/lib/supabase', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    unsubscribe: vi.fn(),
  };

  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        then: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn().mockResolvedValue({ data: null, error: null }),
          remove: vi.fn().mockResolvedValue({ error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'mock-url' } }),
        }),
      },
      channel: vi.fn().mockReturnValue(mockChannel),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  };
});

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    useParams: () => ({}),
  };
});

// Mock Framer Motion for performance
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    form: 'form',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    option: 'option',
    label: 'label',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    p: 'p',
    a: 'a',
    img: 'img',
    ul: 'ul',
    ol: 'ol',
    li: 'li',
    nav: 'nav',
    header: 'header',
    footer: 'footer',
    main: 'main',
    section: 'section',
    article: 'article',
    aside: 'aside',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  useAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  }),
}));

// Export test utilities
export * from '@testing-library/react';
export * from '@testing-library/user-event';
export { vi, expect } from 'vitest';
