/// <reference types="cypress" />

describe("Issue Interactions", () => {
  beforeEach(() => {
    cy.visit("/issues");
  });

  it("should allow viewing issue details", () => {
    // Click on the first issue card
    cy.get('[data-testid="issue-card"]').first().click();

    // Verify that the issue detail dialog is visible
    cy.get('div[role="dialog"]').should("be.visible");
    cy.contains("Issue Details").should("be.visible");

    // Check for tabs in the detail view
    cy.contains("Comments").should("be.visible");
    cy.contains("Updates").should("be.visible");
    cy.contains("Solutions").should("be.visible");
  });

  it("should display issue voting and watching functionality", () => {
    // Click on the first issue card
    cy.get('[data-testid="issue-card"]').first().click();

    // Verify that the issue detail dialog is visible
    cy.get('div[role="dialog"]').should("be.visible");

    // Check for voting and watching buttons
    cy.get('[data-testid="issue-like-button"]').should("be.visible");
    cy.get('[data-testid="issue-watch-button"]').should("be.visible");
  });

  it("should allow creating a new issue", () => {
    // Click on the create issue button
    cy.contains("Report Issue").click();

    // Verify that the create issue dialog is visible
    cy.get('div[role="dialog"]').should("be.visible");
    cy.contains("Report a New Issue").should("be.visible");

    // Fill out the form (without submitting to avoid creating test data)
    cy.get('input[name="title"]').type("Test Issue Title");
    cy.get('textarea[name="description"]').type(
      "This is a test issue description",
    );

    // Select a category
    cy.get('button[role="combobox"]').first().click();
    cy.contains("Infrastructure").click();

    // Enter location
    cy.get('input[name="location"]').type("Test Location");

    // Verify form is valid
    cy.get('button[type="submit"]').should("not.be.disabled");
  });

  it("should allow filtering issues", () => {
    // Use the search input
    cy.get('[data-testid="search-input"]').type("road");

    // Filter by category
    cy.get('[data-testid="category-filter"]').click();
    cy.contains("Infrastructure").click();

    // Filter by status
    cy.get('[data-testid="status-filter"]').click();
    cy.contains("Open").click();

    // Check that filters are applied
    cy.get('[data-testid="active-filters"]').should(
      "contain",
      "Infrastructure",
    );
    cy.get('[data-testid="active-filters"]').should("contain", "Open");
  });
});
