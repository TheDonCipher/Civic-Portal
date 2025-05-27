/**
 * @fileoverview Global Teardown for Playwright E2E Tests
 * @description Cleans up test environment and data after test execution.
 */

import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for E2E tests...');

  try {
    // Clean up test data if needed
    console.log('🗑️ Cleaning up test data...');
    
    // You can add database cleanup here if needed
    // await cleanupTestDatabase();
    
    // Clear any temporary files
    // await cleanupTempFiles();
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here as it might mask test failures
  }
}

export default globalTeardown;
