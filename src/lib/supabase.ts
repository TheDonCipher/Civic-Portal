import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { env, logEnvironmentInfo } from './env';

// Log environment info in development
logEnvironmentInfo();

export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-application-name': 'civic-portal',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
