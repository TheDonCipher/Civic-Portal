/**
 * Information utility functions for the issue tracking system
 */

// Get application version
export const getAppVersion = () => {
  return "1.0.0";
};

// Get environment information
export const getEnvironmentInfo = () => {
  // Use Vite environment variables instead of process.env for browser compatibility
  const mode = import.meta.env.MODE;
  return {
    isDevelopment: mode === "development",
    isProduction: mode === "production",
    isTest: mode === "test",
    mode: mode,
  };
};

// Get feature flags
export const getFeatureFlags = () => {
  return {
    enableMultipleImages: true,
    enableRealtime: true,
    enableVoting: true,
    enableWatching: true,
    enableSolutions: true,
  };
};

// Get application info
export const getAppInfo = () => {
  return {
    name: "Civic Portal",
    version: getAppVersion(),
    environment: getEnvironmentInfo(),
    features: getFeatureFlags(),
  };
};
