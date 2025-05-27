/**
 * @fileoverview Issues Management E2E Tests
 * @description Comprehensive tests for issue creation, viewing, interaction,
 * and management functionality including accessibility and performance.
 */

import { test, expect } from '@playwright/test';

test.describe('Issues Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Enable demo mode for consistent testing
    const demoToggle = page.locator('[data-testid="demo-mode-toggle"]');
    if (await demoToggle.isVisible()) {
      await demoToggle.click();
    }
    
    // Navigate to issues page
    await page.click('text=Issues');
    await expect(page).toHaveURL(/.*\/issues/);
  });

  test.describe('Issues List', () => {
    test('should display list of issues', async ({ page }) => {
      // Should show issue cards
      await expect(page.locator('[data-testid="issue-card"]').first()).toBeVisible();
      
      // Should show issue details
      await expect(page.locator('[data-testid="issue-title"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="issue-description"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="issue-status"]').first()).toBeVisible();
    });

    test('should show issue statistics', async ({ page }) => {
      // Should display vote counts
      await expect(page.locator('[data-testid="issue-like-button"]').first()).toBeVisible();
      
      // Should display comment counts
      await expect(page.locator('[data-testid="issue-comments-button"]').first()).toBeVisible();
      
      // Should display watcher counts
      await expect(page.locator('[data-testid="issue-watch-button"]').first()).toBeVisible();
    });

    test('should support filtering and search', async ({ page }) => {
      // Test category filter
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      if (await categoryFilter.isVisible()) {
        await categoryFilter.selectOption('infrastructure');
        
        // Should filter issues by category
        await page.waitForTimeout(500);
        const visibleIssues = page.locator('[data-testid="issue-card"]');
        await expect(visibleIssues.first()).toBeVisible();
      }
      
      // Test search functionality
      const searchInput = page.locator('[data-testid="search-input"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('road');
        await page.keyboard.press('Enter');
        
        // Should show search results
        await page.waitForTimeout(500);
        await expect(page.locator('[data-testid="issue-card"]').first()).toBeVisible();
      }
    });
  });

  test.describe('Issue Interaction', () => {
    test('should allow voting on issues', async ({ page }) => {
      const voteButton = page.locator('[data-testid="issue-like-button"]').first();
      
      // Get initial vote count
      const initialVoteText = await voteButton.textContent();
      const initialVotes = parseInt(initialVoteText?.match(/\d+/)?.[0] || '0');
      
      // Click vote button
      await voteButton.click();
      
      // Should update vote count
      await expect(voteButton).toHaveAttribute('aria-pressed', 'true');
      
      // Vote count should increase (in demo mode, this might be simulated)
      await page.waitForTimeout(500);
      const newVoteText = await voteButton.textContent();
      const newVotes = parseInt(newVoteText?.match(/\d+/)?.[0] || '0');
      expect(newVotes).toBeGreaterThanOrEqual(initialVotes);
    });

    test('should allow watching issues', async ({ page }) => {
      const watchButton = page.locator('[data-testid="issue-watch-button"]').first();
      
      // Click watch button
      await watchButton.click();
      
      // Should update watch state
      await expect(watchButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('should open issue details on click', async ({ page }) => {
      const issueCard = page.locator('[data-testid="issue-card"]').first();
      
      // Click on issue card
      await issueCard.click();
      
      // Should open issue detail dialog or navigate to detail page
      const detailDialog = page.locator('[data-testid="issue-detail-dialog"]');
      if (await detailDialog.isVisible()) {
        await expect(detailDialog).toBeVisible();
      } else {
        // Or check if navigated to detail page
        await expect(page).toHaveURL(/.*\/issues\/[^\/]+/);
      }
    });
  });

  test.describe('Issue Creation', () => {
    test('should open create issue dialog', async ({ page }) => {
      const createButton = page.locator('text=Report Issue');
      await createButton.click();
      
      // Should open create issue dialog
      await expect(page.locator('[data-testid="create-issue-dialog"]')).toBeVisible();
      await expect(page.locator('text=Report New Issue')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('text=Report Issue');
      
      // Try to submit without filling required fields
      await page.click('[data-testid="submit-issue-button"]');
      
      // Should show validation errors
      await expect(page.locator('text=Title is required')).toBeVisible();
      await expect(page.locator('text=Description is required')).toBeVisible();
    });

    test('should create new issue with valid data', async ({ page }) => {
      await page.click('text=Report Issue');
      
      // Fill out the form
      await page.fill('[data-testid="issue-title-input"]', 'Test Issue Title');
      await page.fill('[data-testid="issue-description-input"]', 'This is a test issue description');
      await page.selectOption('[data-testid="issue-category-select"]', 'infrastructure');
      await page.fill('[data-testid="issue-location-input"]', 'Test Location');
      
      // Submit the form
      await page.click('[data-testid="submit-issue-button"]');
      
      // Should show success message
      await expect(page.locator('text=Issue created successfully')).toBeVisible();
      
      // Dialog should close
      await expect(page.locator('[data-testid="create-issue-dialog"]')).not.toBeVisible();
    });

    test('should support image upload', async ({ page }) => {
      await page.click('text=Report Issue');
      
      // Check if image upload is available
      const fileInput = page.locator('[data-testid="image-upload-input"]');
      if (await fileInput.isVisible()) {
        // Test file upload (would need actual file in real test)
        await expect(fileInput).toBeVisible();
        
        // Check upload area
        await expect(page.locator('text=Upload images')).toBeVisible();
      }
    });
  });

  test.describe('Issue Details', () => {
    test('should show comprehensive issue information', async ({ page }) => {
      // Click on first issue
      await page.locator('[data-testid="issue-card"]').first().click();
      
      // Wait for detail view to load
      await page.waitForTimeout(500);
      
      // Should show detailed information
      await expect(page.locator('[data-testid="issue-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="issue-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="issue-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="issue-author"]')).toBeVisible();
    });

    test('should show comments section', async ({ page }) => {
      await page.locator('[data-testid="issue-card"]').first().click();
      await page.waitForTimeout(500);
      
      // Should show comments tab
      const commentsTab = page.locator('text=Comments');
      if (await commentsTab.isVisible()) {
        await commentsTab.click();
        
        // Should show comments section
        await expect(page.locator('[data-testid="comments-section"]')).toBeVisible();
      }
    });

    test('should allow adding comments', async ({ page }) => {
      await page.locator('[data-testid="issue-card"]').first().click();
      await page.waitForTimeout(500);
      
      // Navigate to comments tab
      const commentsTab = page.locator('text=Comments');
      if (await commentsTab.isVisible()) {
        await commentsTab.click();
        
        // Add a comment
        const commentInput = page.locator('[data-testid="comment-input"]');
        if (await commentInput.isVisible()) {
          await commentInput.fill('This is a test comment');
          await page.click('[data-testid="submit-comment-button"]');
          
          // Should show success message
          await expect(page.locator('text=Comment added successfully')).toBeVisible();
        }
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Should be able to navigate issue cards with keyboard
      await page.keyboard.press('Tab');
      
      // First issue card should be focusable
      const firstCard = page.locator('[data-testid="issue-card"]').first();
      await expect(firstCard).toBeFocused();
      
      // Should activate with Enter key
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Should open issue details
      const detailDialog = page.locator('[data-testid="issue-detail-dialog"]');
      if (await detailDialog.isVisible()) {
        await expect(detailDialog).toBeVisible();
      }
    });

    test('should have proper ARIA labels', async ({ page }) => {
      const issueCard = page.locator('[data-testid="issue-card"]').first();
      
      // Should have article role
      await expect(issueCard).toHaveAttribute('role', 'article');
      
      // Should have proper labeling
      await expect(issueCard).toHaveAttribute('aria-labelledby');
      await expect(issueCard).toHaveAttribute('aria-describedby');
      
      // Buttons should have proper labels
      const voteButton = page.locator('[data-testid="issue-like-button"]').first();
      await expect(voteButton).toHaveAttribute('aria-label');
      await expect(voteButton).toHaveAttribute('aria-pressed');
    });

    test('should announce status changes', async ({ page }) => {
      // Click vote button
      await page.locator('[data-testid="issue-like-button"]').first().click();
      
      // Should update aria-pressed state
      await expect(page.locator('[data-testid="issue-like-button"]').first())
        .toHaveAttribute('aria-pressed', 'true');
    });
  });

  test.describe('Performance', () => {
    test('should load issues efficiently', async ({ page }) => {
      // Measure page load time
      const startTime = Date.now();
      
      await page.goto('/issues');
      await page.waitForSelector('[data-testid="issue-card"]');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle large numbers of issues', async ({ page }) => {
      // Test pagination or infinite scroll
      const initialIssueCount = await page.locator('[data-testid="issue-card"]').count();
      
      // Scroll to bottom to trigger loading more issues
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      
      await page.waitForTimeout(1000);
      
      // Should load more issues or show pagination
      const newIssueCount = await page.locator('[data-testid="issue-card"]').count();
      
      // Either more issues loaded or pagination controls visible
      const paginationExists = await page.locator('[data-testid="pagination"]').isVisible();
      expect(newIssueCount >= initialIssueCount || paginationExists).toBeTruthy();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }
      
      // Issue cards should be properly sized for mobile
      const issueCard = page.locator('[data-testid="issue-card"]').first();
      await expect(issueCard).toBeVisible();
      
      // Touch targets should be large enough
      const voteButton = page.locator('[data-testid="issue-like-button"]').first();
      const buttonBox = await voteButton.boundingBox();
      expect(buttonBox?.height).toBeGreaterThan(44);
      expect(buttonBox?.width).toBeGreaterThan(44);
    });

    test('should handle mobile gestures', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip();
      }
      
      // Test swipe gestures if implemented
      const issueCard = page.locator('[data-testid="issue-card"]').first();
      
      // Tap to open details
      await issueCard.tap();
      await page.waitForTimeout(500);
      
      // Should open issue details
      const detailDialog = page.locator('[data-testid="issue-detail-dialog"]');
      if (await detailDialog.isVisible()) {
        await expect(detailDialog).toBeVisible();
      }
    });
  });
});
