/**
 * @fileoverview React Query Provider
 * @description Provides React Query context with optimized configuration
 * and development tools for the Civic Portal application.
 * 
 * @author Civic Portal Team
 * @version 1.0.0
 * @since 2024-01-01
 * 
 * @example Usage
 * ```typescript
 * import { QueryProvider } from '@/providers/QueryProvider';
 * 
 * function App() {
 *   return (
 *     <QueryProvider>
 *       <YourApp />
 *     </QueryProvider>
 *   );
 * }
 * ```
 */

import React, { ReactNode, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query/queryClient';

// Lazy load dev tools to avoid including them in production bundle
const ReactQueryDevtools = React.lazy(() =>
  import('@tanstack/react-query-devtools').then(module => ({
    default: module.ReactQueryDevtools,
  }))
);

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query Provider component with development tools
 * 
 * @param props - Provider props
 * @returns JSX element with Query Client Provider
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      
      {/* Development tools - only loaded in development */}
      {process.env['NODE_ENV'] === 'development' && (
        <Suspense fallback={null}>
          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom-right"
            toggleButtonProps={{
              style: {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 99999,
                backgroundColor: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}

/**
 * Hook to access the query client instance
 * 
 * @returns Query client instance
 * 
 * @example
 * ```typescript
 * import { useQueryClient } from '@/providers/QueryProvider';
 * 
 * function MyComponent() {
 *   const queryClient = useQueryClient();
 *   
 *   const handleInvalidate = () => {
 *     queryClient.invalidateQueries(['issues']);
 *   };
 *   
 *   return <button onClick={handleInvalidate}>Refresh</button>;
 * }
 * ```
 */
export { useQueryClient } from '@tanstack/react-query';
