# Civic Portal - Complete Source Code Overview

## Architecture Overview

The Civic Portal is built using modern React 18 with TypeScript, leveraging Supabase for backend services and implementing a comprehensive role-based access control system. The application follows a component-driven architecture with clear separation of concerns.

## Key Technologies

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Shadcn UI, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: React Context, Custom Hooks
- **Testing**: Vitest, React Testing Library, Cypress, Playwright
- **Build Tool**: Vite with optimized production builds

## Core Components Architecture

### 1. Authentication System (`src/components/auth/`)

#### AuthProvider.tsx
```typescript
// Comprehensive authentication with security features
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Enhanced sign-up with validation and rate limiting
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    // Rate limiting check
    const rateLimitCheck = await SecurityUtils.checkRateLimit('sign-up', email);
    if (!rateLimitCheck.allowed) {
      throw new Error('Too many sign-up attempts. Please try again later.');
    }

    // Input sanitization
    const sanitizedData = sanitizeFormData(userData);
    
    // Secure account creation
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: sanitizedData,
      },
    });

    if (error) throw error;
    return data;
  };

  // Enhanced sign-in with security measures
  const signIn = async (email: string, password: string) => {
    // Rate limiting for login attempts
    const rateLimitCheck = await SecurityUtils.checkRateLimit('sign-in', email);
    if (!rateLimitCheck.allowed) {
      throw new Error('Too many login attempts. Please try again later.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Log failed attempt
      await SecurityUtils.logSecurityEvent('failed_login', { email });
      throw error;
    }

    return data;
  };
};
```

#### AuthDialog.tsx
```typescript
// Unified authentication dialog with role-based registration
export const AuthDialog = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [userType, setUserType] = useState<'citizen' | 'official'>('citizen');
  const [step, setStep] = useState<'auth' | 'profile' | 'verification'>('auth');

  // Form validation with Zod schemas
  const citizenSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    full_name: z.string().min(2, 'Full name is required'),
    constituency: z.string().min(1, 'Constituency is required'),
  });

  const officialSchema = citizenSchema.extend({
    department_id: z.string().min(1, 'Department is required'),
    government_id: z.string().min(1, 'Government ID is required'),
  });

  // Enhanced form submission with validation
  const handleSubmit = async (formData: FormData) => {
    try {
      setLoading(true);
      
      // Validate form data
      const schema = userType === 'citizen' ? citizenSchema : officialSchema;
      const validatedData = schema.parse(formData);

      if (mode === 'signup') {
        await signUp(validatedData.email, validatedData.password, validatedData);
        setStep('verification');
      } else {
        await signIn(validatedData.email, validatedData.password);
        onClose();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
};
```

### 2. Issue Management System (`src/components/issues/`)

#### IssuesPage.tsx
```typescript
// Main issues page with filtering and real-time updates
export const IssuesPage = () => {
  const { issues, loading, error, refetch } = useRealtimeIssues();
  const [filters, setFilters] = useState<IssueFilters>({
    status: 'all',
    department: 'all',
    category: 'all',
    sortBy: 'created_at',
    sortDirection: 'desc',
  });

  // Advanced filtering with search
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesStatus = filters.status === 'all' || issue.status === filters.status;
      const matchesDepartment = filters.department === 'all' || issue.department_id === filters.department;
      const matchesCategory = filters.category === 'all' || issue.category === filters.category;
      const matchesSearch = !filters.search || 
        issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        issue.description.toLowerCase().includes(filters.search.toLowerCase());

      return matchesStatus && matchesDepartment && matchesCategory && matchesSearch;
    });
  }, [issues, filters]);

  // Optimized rendering with virtualization for large lists
  return (
    <div className="space-y-6">
      <IssueFilters filters={filters} onFiltersChange={setFilters} />
      <VirtualizedIssueList issues={filteredIssues} />
    </div>
  );
};
```

#### IssueCard.tsx
```typescript
// Enhanced issue card with real-time updates
export const IssueCard = ({ issue }: { issue: Issue }) => {
  const [commentsCount, setCommentsCount] = useState(issue.comments_count || 0);
  const [votesCount, setVotesCount] = useState(issue.votes_count || 0);
  const [isWatching, setIsWatching] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Real-time subscription for issue updates
  useEffect(() => {
    let isMounted = true;

    // Subscribe to comments count changes
    const commentsSubscription = supabase
      .channel(`comments-count-${issue.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `issue_id=eq.${issue.id}`,
      }, async () => {
        if (!isMounted) return;
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact' })
          .eq('issue_id', issue.id);
        setCommentsCount(count || 0);
      })
      .subscribe();

    // Subscribe to votes count changes
    const votesSubscription = supabase
      .channel(`votes-count-${issue.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'issue_votes',
        filter: `issue_id=eq.${issue.id}`,
      }, async () => {
        if (!isMounted) return;
        const { count } = await supabase
          .from('issue_votes')
          .select('*', { count: 'exact' })
          .eq('issue_id', issue.id);
        setVotesCount(count || 0);
      })
      .subscribe();

    return () => {
      isMounted = false;
      commentsSubscription.unsubscribe();
      votesSubscription.unsubscribe();
    };
  }, [issue.id]);

  // Optimistic UI updates for voting
  const handleVote = async () => {
    if (hasVoted) return;

    // Optimistic update
    setVotesCount(prev => prev + 1);
    setHasVoted(true);

    try {
      await voteOnIssue(issue.id);
    } catch (error) {
      // Revert optimistic update on error
      setVotesCount(prev => prev - 1);
      setHasVoted(false);
      toast.error('Failed to vote on issue');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold line-clamp-2">{issue.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{issue.department?.name}</span>
              <span>{issue.category}</span>
              <span>{formatDistanceToNow(new Date(issue.created_at))} ago</span>
            </div>
          </div>
          <StatusBadge status={issue.status} />
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {issue.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              disabled={hasVoted}
              className={cn(hasVoted && "text-primary")}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              {votesCount}
            </Button>
            
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              {commentsCount}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleWatching(issue.id)}
              className={cn(isWatching && "text-primary")}
            >
              <Eye className="h-4 w-4 mr-1" />
              {isWatching ? 'Watching' : 'Watch'}
            </Button>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => openIssueDetail(issue)}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

### 3. Demo Mode Implementation (`src/providers/DemoProvider.tsx`)

```typescript
// Sophisticated demo mode with realistic data simulation
export const DemoProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [demoData, setDemoData] = useState<DemoData>({
    issues: [],
    users: [],
    comments: [],
    departments: [],
  });

  // Initialize demo data with realistic Botswana content
  useEffect(() => {
    if (isDemoMode) {
      const data = generateDemoData();
      setDemoData(data);
    }
  }, [isDemoMode]);

  // Demo user switching functionality
  const switchDemoUser = (userType: 'citizen' | 'stakeholder' | 'admin') => {
    const user = demoData.users.find(u => u.role === userType);
    if (user) {
      setDemoUser(user);
      // Simulate authentication state
      localStorage.setItem('demo-user', JSON.stringify(user));
    }
  };

  // Demo data generation with realistic Botswana issues
  const generateDemoData = (): DemoData => {
    const departments = BOTSWANA_DEPARTMENTS;
    const constituencies = BOTSWANA_CONSTITUENCIES;
    
    // Generate 150+ realistic issues
    const issues = Array.from({ length: 150 }, (_, index) => ({
      id: `demo-issue-${index + 1}`,
      title: generateRealisticIssueTitle(index),
      description: generateRealisticIssueDescription(index),
      status: getRandomStatus(),
      category: getRandomCategory(),
      department_id: getRandomDepartment(departments).id,
      constituency: getRandomConstituency(constituencies),
      created_at: generateRealisticDate(),
      votes_count: Math.floor(Math.random() * 100),
      comments_count: Math.floor(Math.random() * 20),
      watchers_count: Math.floor(Math.random() * 50),
    }));

    return { issues, users: generateDemoUsers(), comments: [], departments };
  };

  return (
    <DemoContext.Provider value={{
      isDemoMode,
      demoUser,
      demoData,
      setIsDemoMode,
      switchDemoUser,
      exitDemoMode: () => {
        setIsDemoMode(false);
        setDemoUser(null);
        localStorage.removeItem('demo-user');
      },
    }}>
      {children}
    </DemoContext.Provider>
  );
};
```

### 4. Real-time Features (`src/hooks/useRealtimeIssues.ts`)

```typescript
// Optimized real-time issue management
export const useRealtimeIssues = (filters?: IssueFilters) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch issues with optimized query
  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('issues')
        .select(`
          *,
          department:departments(name),
          user:users(full_name),
          comments_count:comments(count),
          votes_count:issue_votes(count),
          watchers_count:issue_watchers(count)
        `);

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.department && filters.department !== 'all') {
        query = query.eq('department_id', filters.department);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      // Apply sorting
      query = query.order(filters?.sortBy || 'created_at', {
        ascending: filters?.sortDirection === 'asc',
      });

      const { data, error } = await query;
      
      if (error) throw error;
      setIssues(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Set up real-time subscriptions
  useEffect(() => {
    let isMounted = true;
    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      // Initial fetch
      if (isMounted) {
        await fetchIssues();
      }

      // Create unique channel to prevent conflicts
      const channelName = `issues-${JSON.stringify(filters)}`;
      channel = supabase.channel(channelName)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'issues',
        }, (payload) => {
          if (!isMounted) return;
          setIssues(prev => [payload.new as Issue, ...prev]);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'issues',
        }, (payload) => {
          if (!isMounted) return;
          setIssues(prev => prev.map(issue => 
            issue.id === payload.new.id ? { ...issue, ...payload.new } : issue
          ));
        })
        .on('postgres_changes', {
          event: 'DELETE',
          schema: 'public',
          table: 'issues',
        }, (payload) => {
          if (!isMounted) return;
          setIssues(prev => prev.filter(issue => issue.id !== payload.old.id));
        })
        .subscribe();
    };

    setupSubscription();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [filters, fetchIssues]);

  return { issues, loading, error, refetch: fetchIssues };
};
```

### 5. Accessibility Implementation (`src/lib/utils/accessibilityUtils.ts`)

```typescript
// Comprehensive accessibility utilities for WCAG 2.1 AA compliance
export const AccessibilityUtils = {
  // Color contrast validation
  colorContrast: {
    getContrastRatio: (foreground: string, background: string): number => {
      const fgLuminance = getLuminance(foreground);
      const bgLuminance = getLuminance(background);
      const lighter = Math.max(fgLuminance, bgLuminance);
      const darker = Math.min(fgLuminance, bgLuminance);
      return (lighter + 0.05) / (darker + 0.05);
    },

    meetsWCAG: (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
      const ratio = AccessibilityUtils.colorContrast.getContrastRatio(foreground, background);
      const threshold = level === 'AAA' ? 7 : 4.5;
      return ratio >= threshold;
    },
  },

  // Focus management
  focusManagement: {
    trapFocus: (element: HTMLElement) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      element.addEventListener('keydown', handleTabKey);
      firstElement.focus();

      return () => element.removeEventListener('keydown', handleTabKey);
    },
  },

  // Screen reader announcements
  announceToScreenReader: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
};
```

## Performance Optimizations

### Bundle Splitting (vite.config.ts)
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-toast', '@radix-ui/react-dialog'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'chart-vendor': ['recharts'],
          'editor-vendor': ['react-quill'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
```

### Lazy Loading Implementation
```typescript
// Comprehensive lazy loading with enhanced fallbacks
const Home = React.lazy(() => import('./components/home'));
const IssuesPage = React.lazy(() => import('./components/issues/IssuesPage'));
const AdminPage = React.lazy(() => import('./components/admin/AdminPage'));

const LoadingFallback = ({ name }: { name?: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      <p className="text-lg font-medium">
        {name ? `Loading ${name}...` : 'Loading...'}
      </p>
    </div>
  </div>
);
```

## Security Implementation

### Input Sanitization
```typescript
// Comprehensive input sanitization
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = DOMPurify.sanitize(value.trim());
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? DOMPurify.sanitize(item.trim()) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};
```

### Rate Limiting
```typescript
// Client-side rate limiting implementation
export const RateLimiter = {
  attempts: new Map<string, { count: number; resetTime: number }>(),
  
  checkLimit: (key: string, maxAttempts: number = 5, windowMs: number = 900000): boolean => {
    const now = Date.now();
    const attempt = RateLimiter.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      RateLimiter.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (attempt.count >= maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  },
};
```

This comprehensive source code overview demonstrates the sophisticated architecture and implementation of the Civic Portal, showcasing modern React development practices with a focus on user experience, security, and performance optimization.
