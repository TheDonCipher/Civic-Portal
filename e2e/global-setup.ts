/**
 * @fileoverview Global Setup for Playwright E2E Tests
 * @description Sets up test environment, database state, and authentication
 * for comprehensive end-to-end testing.
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...');

  // Launch browser for setup operations
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the development server to be ready
    console.log('⏳ Waiting for development server...');
    await page.goto(config.projects[0].use.baseURL || 'http://localhost:5173');
    await page.waitForSelector('body', { timeout: 30000 });
    console.log('✅ Development server is ready');

    // Set up test data if needed
    console.log('📊 Setting up test data...');
    
    // You can add database seeding here if needed
    // await seedTestDatabase();
    
    // Create test users for authentication tests
    await setupTestUsers(page);
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Sets up test users for authentication testing
 */
async function setupTestUsers(page: any) {
  try {
    // Navigate to demo mode to avoid actual user creation
    await page.goto('/');
    
    // Check if demo mode toggle exists and enable it
    const demoToggle = page.locator('[data-testid="demo-mode-toggle"]');
    if (await demoToggle.isVisible()) {
      await demoToggle.click();
      console.log('✅ Demo mode enabled for testing');
    }
    
    // Store demo mode state for tests
    await page.evaluate(() => {
      localStorage.setItem('e2e-demo-mode', 'true');
    });
    
  } catch (error) {
    console.warn('⚠️ Could not set up demo mode, tests will use regular mode');
  }
}

export default globalSetup;
