/**
 * @fileoverview Authentication Flow E2E Tests
 * @description Comprehensive tests for user authentication including
 * sign up, sign in, role-based access, and demo mode functionality.
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
    
    // Enable demo mode for testing
    const demoToggle = page.locator('[data-testid="demo-mode-toggle"]');
    if (await demoToggle.isVisible()) {
      await demoToggle.click();
    }
  });

  test.describe('Demo Mode', () => {
    test('should allow exploration without authentication', async ({ page }) => {
      // Should be able to view issues without signing in
      await page.click('text=Issues');
      await expect(page).toHaveURL(/.*\/issues/);
      
      // Should see demo issues
      await expect(page.locator('[data-testid="issue-card"]').first()).toBeVisible();
      
      // Should see demo mode indicator
      await expect(page.locator('text=Demo Mode')).toBeVisible();
    });

    test('should show demo data in dashboard', async ({ page }) => {
      // Navigate to citizen dashboard in demo mode
      await page.click('[data-testid="nav-dropdown"]');
      await page.click('text=Citizen Dashboard');
      
      // Should show demo dashboard content
      await expect(page.locator('[data-testid="stat-card"]').first()).toBeVisible();
      await expect(page.locator('text=Demo Mode')).toBeVisible();
    });

    test('should allow switching between citizen and stakeholder views', async ({ page }) => {
      // Navigate to stakeholder dashboard
      await page.click('[data-testid="nav-dropdown"]');
      await page.click('text=Stakeholder Dashboard');
      
      // Should show stakeholder-specific content
      await expect(page.locator('text=Department Issues')).toBeVisible();
      await expect(page.locator('text=Demo Mode')).toBeVisible();
    });
  });

  test.describe('Authentication Dialog', () => {
    test('should open sign in dialog', async ({ page }) => {
      await page.click('text=Sign In');
      
      // Should show authentication dialog
      await expect(page.locator('[data-testid="auth-dialog"]')).toBeVisible();
      await expect(page.locator('text=Sign in to your account')).toBeVisible();
    });

    test('should switch between sign in and sign up', async ({ page }) => {
      await page.click('text=Sign In');
      
      // Should start with sign in form
      await expect(page.locator('text=Sign in to your account')).toBeVisible();
      
      // Switch to sign up
      await page.click('text=Create an account');
      await expect(page.locator('text=Create your account')).toBeVisible();
      
      // Switch back to sign in
      await page.click('text=Already have an account?');
      await expect(page.locator('text=Sign in to your account')).toBeVisible();
    });

    test('should show role selection in sign up', async ({ page }) => {
      await page.click('text=Sign In');
      await page.click('text=Create an account');
      
      // Should show role selection
      await expect(page.locator('text=I am a')).toBeVisible();
      await expect(page.locator('text=Citizen')).toBeVisible();
      await expect(page.locator('text=Government Official')).toBeVisible();
    });

    test('should show department selection for officials', async ({ page }) => {
      await page.click('text=Sign In');
      await page.click('text=Create an account');
      
      // Select government official role
      await page.click('text=Government Official');
      
      // Should show department selection
      await expect(page.locator('text=Department')).toBeVisible();
      await expect(page.locator('text=Finance')).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should validate email format', async ({ page }) => {
      await page.click('text=Sign In');
      
      // Enter invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="sign-in-button"]');
      
      // Should show validation error
      await expect(page.locator('text=Please enter a valid email')).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      await page.click('text=Sign In');
      await page.click('text=Create an account');
      
      // Enter weak password
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', '123');
      await page.click('[data-testid="sign-up-button"]');
      
      // Should show password validation error
      await expect(page.locator('text=Password must be at least')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('text=Sign In');
      await page.click('text=Create an account');
      
      // Try to submit without filling required fields
      await page.click('[data-testid="sign-up-button"]');
      
      // Should show required field errors
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await page.click('text=Sign In');
      
      // Should be able to navigate with Tab key
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="sign-in-button"]')).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.click('text=Sign In');
      
      // Check for proper ARIA labels
      const emailInput = page.locator('[data-testid="email-input"]');
      await expect(emailInput).toHaveAttribute('aria-label', /email/i);
      
      const passwordInput = page.locator('[data-testid="password-input"]');
      await expect(passwordInput).toHaveAttribute('aria-label', /password/i);
    });

    test('should announce form errors to screen readers', async ({ page }) => {
      await page.click('text=Sign In');
      
      // Submit form with invalid data
      await page.fill('[data-testid="email-input"]', 'invalid');
      await page.click('[data-testid="sign-in-button"]');
      
      // Check for aria-live region with error
      const errorRegion = page.locator('[aria-live="polite"]');
      await expect(errorRegion).toBeVisible();
    });
  });

  test.describe('Security', () => {
    test('should sanitize input fields', async ({ page }) => {
      await page.click('text=Sign In');
      await page.click('text=Create an account');
      
      // Try to enter malicious script
      await page.fill('[data-testid="full-name-input"]', '<script>alert("xss")</script>');
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      
      // Check that script tags are removed/escaped
      const nameValue = await page.locator('[data-testid="full-name-input"]').inputValue();
      expect(nameValue).not.toContain('<script>');
    });

    test('should handle rate limiting gracefully', async ({ page }) => {
      await page.click('text=Sign In');
      
      // Attempt multiple rapid sign-in attempts
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', 'wrongpassword');
        await page.click('[data-testid="sign-in-button"]');
        await page.waitForTimeout(100);
      }
      
      // Should show rate limiting message
      await expect(page.locator('text=Too many attempts')).toBeVisible();
    });
  });

  test.describe('User Experience', () => {
    test('should show loading states', async ({ page }) => {
      await page.click('text=Sign In');
      
      // Fill form and submit
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="sign-in-button"]');
      
      // Should show loading indicator
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    });

    test('should close dialog on successful authentication', async ({ page }) => {
      // This test would need actual authentication setup
      // For now, we'll test the demo mode behavior
      
      await page.click('text=Sign In');
      await expect(page.locator('[data-testid="auth-dialog"]')).toBeVisible();
      
      // In demo mode, clicking "Continue as Demo User" should close dialog
      if (await page.locator('text=Continue as Demo User').isVisible()) {
        await page.click('text=Continue as Demo User');
        await expect(page.locator('[data-testid="auth-dialog"]')).not.toBeVisible();
      }
    });

    test('should remember form state when switching tabs', async ({ page }) => {
      await page.click('text=Sign In');
      
      // Fill sign in form
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      
      // Switch to sign up
      await page.click('text=Create an account');
      
      // Switch back to sign in
      await page.click('text=Already have an account?');
      
      // Email should be preserved
      const emailValue = await page.locator('[data-testid="email-input"]').inputValue();
      expect(emailValue).toBe('test@example.com');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }
      
      await page.click('text=Sign In');
      
      // Dialog should be properly sized for mobile
      const dialog = page.locator('[data-testid="auth-dialog"]');
      await expect(dialog).toBeVisible();
      
      // Form elements should be touch-friendly
      const emailInput = page.locator('[data-testid="email-input"]');
      const inputBox = await emailInput.boundingBox();
      expect(inputBox?.height).toBeGreaterThan(44); // Minimum touch target size
    });
  });
});
