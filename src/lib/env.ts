/**
 * Environment variable validation and management
 * Ensures all required environment variables are present and valid
 */

interface RequiredEnvVars {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

interface OptionalEnvVars {
  VITE_TEMPO?: string;
  VITE_ENABLE_REALTIME?: string;
  VITE_ENABLE_ANALYTICS?: string;
  VITE_SHOW_CONNECTION_STATUS?: string;
}

// Validate required environment variables
const requiredEnvVars: RequiredEnvVars = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
} as const;

// Optional environment variables with defaults
const optionalEnvVars: OptionalEnvVars = {
  VITE_TEMPO: import.meta.env.VITE_TEMPO || 'false',
  VITE_ENABLE_REALTIME: import.meta.env.VITE_ENABLE_REALTIME || 'true',
  VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS || 'false',
  VITE_SHOW_CONNECTION_STATUS: import.meta.env.VITE_SHOW_CONNECTION_STATUS || 'true',
};

/**
 * Validates that all required environment variables are present
 * Throws an error if any required variables are missing
 */
function validateEnvironmentVariables(): void {
  const missingVars: string[] = [];

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error(errorMessage);
    console.error('Please check your .env file and ensure all required variables are set.');
    console.error('Available environment variables:', Object.keys(import.meta.env));
    throw new Error(errorMessage);
  }

  // Validate URL format for Supabase URL
  try {
    new URL(requiredEnvVars.VITE_SUPABASE_URL);
  } catch (error) {
    const errorMessage = 'VITE_SUPABASE_URL is not a valid URL';
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }

  // Validate Supabase key format (basic JWT structure check)
  if (!requiredEnvVars.VITE_SUPABASE_ANON_KEY.includes('.')) {
    const errorMessage = 'VITE_SUPABASE_ANON_KEY does not appear to be a valid JWT token';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Gets a boolean value from environment variables
 */
function getBooleanEnv(key: keyof OptionalEnvVars, defaultValue = false): boolean {
  const value = optionalEnvVars[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Gets a string value from environment variables
 */
function getStringEnv(key: keyof OptionalEnvVars, defaultValue = ''): string {
  return optionalEnvVars[key] || defaultValue;
}

// Validate environment variables on module load
validateEnvironmentVariables();

// Export validated environment variables
export const env = {
  // Required variables (guaranteed to be present after validation)
  SUPABASE_URL: requiredEnvVars.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: requiredEnvVars.VITE_SUPABASE_ANON_KEY,
  
  // Optional variables with type-safe getters
  TEMPO_ENABLED: getBooleanEnv('VITE_TEMPO'),
  REALTIME_ENABLED: getBooleanEnv('VITE_ENABLE_REALTIME', true),
  ANALYTICS_ENABLED: getBooleanEnv('VITE_ENABLE_ANALYTICS'),
  CONNECTION_STATUS_ENABLED: getBooleanEnv('VITE_SHOW_CONNECTION_STATUS', true),
} as const;

// Export utility functions
export { getBooleanEnv, getStringEnv, validateEnvironmentVariables };

// Development mode helpers
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

/**
 * Logs environment configuration in development mode
 * Excludes sensitive information
 */
export function logEnvironmentInfo(): void {
  if (isDevelopment) {
    console.log('🔧 Environment Configuration:');
    console.log('- Mode:', import.meta.env.MODE);
    console.log('- Supabase URL:', env.SUPABASE_URL);
    console.log('- Realtime Enabled:', env.REALTIME_ENABLED);
    console.log('- Analytics Enabled:', env.ANALYTICS_ENABLED);
    console.log('- Connection Status:', env.CONNECTION_STATUS_ENABLED);
    console.log('- Tempo Enabled:', env.TEMPO_ENABLED);
  }
}
