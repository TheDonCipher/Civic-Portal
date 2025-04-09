/**
 * Information utility functions for the issue tracking system
 */

// Get application version
export const getAppVersion = () => {
  return "1.0.0";
};

// Get environment information
export const getEnvironmentInfo = () => {
  return {
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
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
