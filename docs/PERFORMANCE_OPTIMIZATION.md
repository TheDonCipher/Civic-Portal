# Performance Optimization Guide

## Overview

This guide provides comprehensive performance optimization strategies for the Civic Portal application, covering bundle optimization, caching strategies, and runtime performance monitoring.

## Bundle Optimization

### 1. Bundle Analysis

Use the following commands to analyze your bundle:

```bash
# Generate bundle analysis report
npm run analyze:bundle

# Check bundle sizes against limits
npm run analyze:size

# Check for unused dependencies
npm run analyze:deps
```

### 2. Code Splitting Strategy

The application uses strategic code splitting:

#### Vendor Chunks
- `react-vendor`: React core libraries
- `ui-vendor`: UI component libraries
- `query-vendor`: React Query
- `supabase-vendor`: Supabase client
- `form-vendor`: Form handling libraries
- `chart-vendor`: Chart libraries
- `utils-vendor`: Utility libraries
- `animation-vendor`: Animation libraries

#### Feature Chunks
- `admin-features`: Admin-specific components
- `stakeholder-features`: Stakeholder dashboard components
- `demo-features`: Demo mode components

### 3. Bundle Size Targets

| Chunk Type | Target Size (gzipped) | Current Limit |
|------------|----------------------|---------------|
| Main Bundle | < 500kb | 500kb |
| React Vendor | < 200kb | 200kb |
| UI Vendor | < 150kb | 150kb |
| Query Vendor | < 100kb | 100kb |
| Other Vendors | < 100kb each | 100kb |

## React Query Optimization

### 1. Caching Strategy

```typescript
// Optimized query configuration
const queryOptions = {
  staleTime: 1000 * 60 * 2, // 2 minutes
  gcTime: 1000 * 60 * 10,   // 10 minutes
  retry: 3,
  refetchOnWindowFocus: true,
};
```

### 2. Query Key Management

Use the centralized query key factory:

```typescript
import { queryKeys } from '@/lib/query/queryClient';

// Consistent query keys
const issuesQuery = useQuery({
  queryKey: queryKeys.issues.list(filters),
  queryFn: () => getIssues(filters),
});
```

### 3. Optimistic Updates

Implement optimistic updates for better UX:

```typescript
const createIssue = useCreateIssue({
  onMutate: async (newIssue) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: queryKeys.issues.all });
    
    // Optimistically update cache
    queryClient.setQueriesData(
      { queryKey: queryKeys.issues.lists() },
      (old) => old ? { ...old, data: [newIssue, ...old.data] } : old
    );
  },
});
```

## Performance Monitoring

### 1. Core Web Vitals

Monitor these key metrics:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 2. Custom Performance Tracking

```typescript
import { usePerformance } from '@/hooks/usePerformance';

function MyComponent() {
  const { trackRender, trackApiCall } = usePerformance('MyComponent');
  
  useEffect(() => {
    trackRender();
  }, []);
  
  const handleApiCall = async () => {
    const { result, duration } = await trackApiCall('fetchData', fetchData);
    console.log(`API call took ${duration}ms`);
  };
}
```

### 3. Performance Reports

Access performance data:

```typescript
import { performanceMonitor } from '@/lib/utils/performanceMonitor';

// Get comprehensive report
const report = performanceMonitor.getReport();

// Get performance score
const score = performanceMonitor.getPerformanceScore();
```

## Runtime Optimizations

### 1. Component Optimization

#### React.memo Usage
```typescript
import { memo } from 'react';

const OptimizedComponent = memo(function MyComponent({ data }) {
  return <div>{data.title}</div>;
});
```

#### useMemo for Expensive Calculations
```typescript
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

#### useCallback for Event Handlers
```typescript
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

### 2. Lazy Loading

#### Route-based Code Splitting
```typescript
const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
```

#### Image Lazy Loading
```typescript
<img 
  src={imageSrc} 
  loading="lazy" 
  alt="Description"
/>
```

### 3. Virtual Scrolling

For large lists, implement virtual scrolling:

```typescript
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
      itemData={items}
    >
      {Row}
    </List>
  );
}
```

## Network Optimization

### 1. API Optimization

#### Request Batching
```typescript
// Batch multiple requests
const batchedData = await Promise.all([
  getIssues(),
  getUsers(),
  getStats(),
]);
```

#### Request Deduplication
React Query automatically deduplicates identical requests.

#### Pagination
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteIssues(filters);
```

### 2. Caching Headers

Configure appropriate cache headers:

```typescript
// API responses should include:
Cache-Control: public, max-age=300, stale-while-revalidate=60
```

### 3. Compression

Enable gzip/brotli compression on the server.

## Image Optimization

### 1. Format Selection
- Use WebP for modern browsers
- Provide fallbacks for older browsers
- Use SVG for icons and simple graphics

### 2. Responsive Images
```typescript
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Description" />
</picture>
```

### 3. Image Compression
- Optimize images before deployment
- Use appropriate quality settings
- Consider progressive JPEG for large images

## CSS Optimization

### 1. Critical CSS
Extract and inline critical CSS for above-the-fold content.

### 2. CSS Purging
Tailwind CSS automatically purges unused styles in production.

### 3. CSS-in-JS Optimization
- Use static styles when possible
- Avoid dynamic style generation in render

## Monitoring and Alerts

### 1. Performance Budgets

Set up performance budgets in CI/CD:

```json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "500kb",
      "maximumError": "1mb"
    }
  ]
}
```

### 2. Lighthouse CI

Integrate Lighthouse CI for automated performance testing:

```yaml
# .github/workflows/lighthouse.yml
- name: Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun
```

### 3. Real User Monitoring

Monitor real user performance:

```typescript
// Track Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Best Practices

### 1. Development
- Use React DevTools Profiler
- Monitor bundle size during development
- Profile components regularly
- Use performance hooks for tracking

### 2. Testing
- Include performance tests in CI/CD
- Test on various devices and networks
- Monitor performance regressions
- Use synthetic monitoring

### 3. Deployment
- Enable compression
- Use CDN for static assets
- Implement proper caching strategies
- Monitor production performance

## Troubleshooting

### Common Performance Issues

1. **Large Bundle Size**
   - Check for duplicate dependencies
   - Implement proper code splitting
   - Remove unused code

2. **Slow API Calls**
   - Implement caching
   - Optimize database queries
   - Use pagination

3. **Memory Leaks**
   - Clean up event listeners
   - Cancel ongoing requests
   - Properly dispose of subscriptions

4. **Layout Shifts**
   - Reserve space for dynamic content
   - Use skeleton loaders
   - Avoid inserting content above existing content

### Performance Debugging

```typescript
// Enable performance debugging
if (process.env.NODE_ENV === 'development') {
  // Log performance metrics
  performanceMonitor.logReport();
  
  // Enable React DevTools Profiler
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.onCommitFiberRoot = (id, root) => {
    console.log('React render:', id, root);
  };
}
```

## Conclusion

Regular performance monitoring and optimization are crucial for maintaining a fast, responsive application. Use the tools and strategies outlined in this guide to ensure optimal performance for all users.
