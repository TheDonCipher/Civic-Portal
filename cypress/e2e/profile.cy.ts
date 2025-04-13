/// <reference types="cypress" />

describe("Profile Page", () => {
  beforeEach(() => {
    cy.visit("/profile");
  });

  it("should display the profile page with demo data when not logged in", () => {
    cy.contains("Demo Profile").should("be.visible");
    cy.contains("Demo User").should("be.visible");
  });

  it("should display user's created issues", () => {
    cy.contains("Issues Created").should("be.visible");
    cy.get('[data-testid="created-issues-tab"]').click();
    cy.get('[data-testid="issue-card"]').should("exist");
  });

  it("should display user's watched issues", () => {
    cy.contains("Issues Watching").should("be.visible");
    cy.get('[data-testid="watching-issues-tab"]').click();
    cy.get('[data-testid="issue-card"]').should("exist");
  });

  it("should open issue details when clicking on an issue card", () => {
    cy.get('[data-testid="created-issues-tab"]').click();
    cy.get('[data-testid="issue-card"]').first().click();

    // Verify that the issue detail dialog is visible
    cy.get('div[role="dialog"]').should("be.visible");
    cy.contains("Issue Details").should("be.visible");
  });

  it("should allow creating a new issue from profile page", () => {
    cy.contains("Report Issue").click();

    // Verify that the create issue dialog is visible
    cy.get('div[role="dialog"]').should("be.visible");
    cy.contains("Report a New Issue").should("be.visible");
  });
});
