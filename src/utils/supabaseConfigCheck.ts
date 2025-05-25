import { supabase } from '@/lib/supabase';

export interface ConfigCheckResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface SupabaseConfigCheck {
  connection: ConfigCheckResult;
  authentication: ConfigCheckResult;
  database: ConfigCheckResult;
  emailSettings: ConfigCheckResult;
  overall: 'healthy' | 'issues' | 'critical';
}

export async function checkSupabaseConfiguration(): Promise<SupabaseConfigCheck> {
  const results: SupabaseConfigCheck = {
    connection: { status: 'error', message: 'Not checked' },
    authentication: { status: 'error', message: 'Not checked' },
    database: { status: 'error', message: 'Not checked' },
    emailSettings: { status: 'error', message: 'Not checked' },
    overall: 'critical',
  };

  // 1. Check basic connection
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    if (error) {
      results.connection = {
        status: 'error',
        message: 'Database connection failed',
        details: error.message,
      };
    } else {
      results.connection = {
        status: 'success',
        message: 'Database connection successful',
      };
    }
  } catch (error) {
    results.connection = {
      status: 'error',
      message: 'Connection error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 2. Check authentication configuration
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      results.authentication = {
        status: 'warning',
        message: 'Auth session check failed',
        details: error.message,
      };
    } else {
      results.authentication = {
        status: 'success',
        message: session
          ? 'User authenticated'
          : 'Auth system working (no active session)',
      };
    }
  } catch (error) {
    results.authentication = {
      status: 'error',
      message: 'Authentication system error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 3. Check database schema
  try {
    // Check if profiles table exists and has required columns
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, constituency, department')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "profiles" does not exist')) {
        results.database = {
          status: 'error',
          message: 'Profiles table missing',
          details: 'Run database migrations to create required tables',
        };
      } else {
        results.database = {
          status: 'warning',
          message: 'Database schema issues',
          details: error.message,
        };
      }
    } else {
      results.database = {
        status: 'success',
        message: 'Database schema looks good',
      };
    }
  } catch (error) {
    results.database = {
      status: 'error',
      message: 'Database schema check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 4. Check email configuration (indirect)
  try {
    // Check if we can access auth settings (this is limited but we can try)
    const currentUrl = window.location.origin;
    const expectedCallbackUrl = `${currentUrl}/auth/callback`;

    results.emailSettings = {
      status: 'warning',
      message: 'Email settings need manual verification',
      details: `Ensure Supabase redirect URLs include: ${expectedCallbackUrl}`,
    };
  } catch (error) {
    results.emailSettings = {
      status: 'error',
      message: 'Cannot check email settings',
      details: 'Manual verification required in Supabase dashboard',
    };
  }

  // Determine overall health
  const errorCount = Object.values(results).filter(
    (r) => r.status === 'error'
  ).length;
  const warningCount = Object.values(results).filter(
    (r) => r.status === 'warning'
  ).length;

  if (errorCount > 0) {
    results.overall = 'critical';
  } else if (warningCount > 0) {
    results.overall = 'issues';
  } else {
    results.overall = 'healthy';
  }

  return results;
}

export function getConfigurationInstructions(): string[] {
  const currentUrl = window.location.origin;

  return [
    '🔧 Supabase Configuration Checklist:',
    '',
    '1. Authentication Settings:',
    `   - Site URL: ${currentUrl}`,
    `   - Redirect URLs: ${currentUrl}/auth/callback`,
    '   - Enable email confirmations: ON',
    '',
    '2. Email Templates:',
    '   - Confirm signup template should use: {{ .SiteURL }}/auth/callback',
    '',
    '3. Database:',
    '   - Run all migrations',
    '   - Check RLS policies on profiles table',
    '',
    '4. Environment Variables:',
    '   - VITE_SUPABASE_URL is set',
    '   - VITE_SUPABASE_ANON_KEY is set',
    '',
    '5. Development:',
    `   - Access app via: ${currentUrl}`,
    '   - Not 127.0.0.1 or other IPs',
  ];
}

export async function testEmailVerificationFlow(
  email: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('Testing email verification flow...');

    // Try to sign up a test user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return {
        success: false,
        message: 'Signup failed',
        details: error,
      };
    }

    if (data.user && !data.user.email_confirmed_at) {
      return {
        success: true,
        message: 'Signup successful, check email for verification link',
        details: {
          userId: data.user.id,
          email: data.user.email,
          needsConfirmation: true,
        },
      };
    }

    if (data.user && data.user.email_confirmed_at) {
      return {
        success: true,
        message: 'User created and automatically confirmed',
        details: {
          userId: data.user.id,
          email: data.user.email,
          needsConfirmation: false,
        },
      };
    }

    return {
      success: false,
      message: 'Unexpected signup result',
      details: data,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Test failed with exception',
      details: error,
    };
  }
}

// Development helper to log configuration status
export async function logConfigurationStatus(): Promise<void> {
  if (!import.meta.env.DEV) return;

  console.group('🔍 Supabase Configuration Check');

  const config = await checkSupabaseConfiguration();

  console.log('Overall Status:', config.overall);
  console.log('Connection:', config.connection);
  console.log('Authentication:', config.authentication);
  console.log('Database:', config.database);
  console.log('Email Settings:', config.emailSettings);

  console.group('📋 Configuration Instructions');
  getConfigurationInstructions().forEach((instruction) => {
    console.log(instruction);
  });
  console.groupEnd();

  console.groupEnd();
}

// Auto-run in development
if (import.meta.env.DEV) {
  // Run configuration check after a short delay
  setTimeout(logConfigurationStatus, 2000);
}
