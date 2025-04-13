/// <reference types="cypress" />

describe("Integration Flows", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should navigate through the main application flow", () => {
    // Start at home page
    cy.contains("Government Issue Tracking Portal").should("be.visible");

    // Navigate to issues page
    cy.contains("View Issues").click();
    cy.url().should("include", "/issues");
    cy.get('[data-testid="issue-grid"]').should("be.visible");

    // View an issue
    cy.get('[data-testid="issue-card"]').first().click();
    cy.get('div[role="dialog"]').should("be.visible");
    cy.contains("Issue Details").should("be.visible");

    // Close the dialog
    cy.get('button[aria-label="Close"]').click();

    // Navigate to reports page
    cy.contains("Reports").click();
    cy.url().should("include", "/reports");
    cy.contains("Government Analytics Dashboard").should("be.visible");

    // Navigate to profile page
    cy.contains("Profile").click();
    cy.url().should("include", "/profile");
    cy.get('[data-testid="user-profile"]').should("be.visible");
  });

  it("should show auth flow and redirect appropriately", () => {
    // Click sign in
    cy.contains("Sign In").click();
    cy.get('div[role="dialog"]').should("be.visible");

    // Switch to sign up
    cy.get('button[value="sign-up"]').click();
    cy.contains("Create an account").should("be.visible");

    // Close dialog
    cy.get('button[aria-label="Close"]').click();

    // Try to access a protected route
    cy.visit("/stakeholder");

    // Should redirect to sign in
    cy.url().should("include", "/");
    cy.get('div[role="dialog"]').should("be.visible");
    cy.contains("Sign in to your account").should("be.visible");
  });

  it("should connect reports data with issues data", () => {
    // Go to reports page
    cy.visit("/reports");
    cy.contains("Government Analytics Dashboard").should("be.visible");

    // Check for issue statistics
    cy.contains("Total Issues").should("be.visible");

    // Navigate to issues page
    cy.contains("Issues").click();
    cy.url().should("include", "/issues");

    // Verify issues are displayed
    cy.get('[data-testid="issue-card"]').should("exist");
  });
});
