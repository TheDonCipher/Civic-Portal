/// <reference types="cypress" />

describe("Issues Page", () => {
  beforeEach(() => {
    cy.visit("/issues");
  });

  it("should display the issues grid", () => {
    cy.get('[data-testid="issue-grid"]').should("be.visible");
  });

  it("should filter issues when using the filter bar", () => {
    // Open the filter dropdown
    cy.get('[data-testid="filter-dropdown"]').click();

    // Select a category filter
    cy.contains("Infrastructure").click();

    // Verify that the filter was applied
    cy.get('[data-testid="active-filters"]').should(
      "contain",
      "Infrastructure",
    );
  });

  it("should open issue details when clicking on an issue card", () => {
    // Click on the first issue card
    cy.get('[data-testid="issue-card"]').first().click();

    // Verify that the issue detail dialog is visible
    cy.get('div[role="dialog"]').should("be.visible");
    cy.contains("Issue Details").should("be.visible");
  });

  it("should open create issue dialog when clicking create button", () => {
    // Click on the create issue button
    cy.contains("Report Issue").click();

    // Verify that the create issue dialog is visible
    cy.get('div[role="dialog"]').should("be.visible");
    cy.contains("Report a New Issue").should("be.visible");
  });
});
