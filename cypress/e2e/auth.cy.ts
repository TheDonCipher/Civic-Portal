/// <reference types="cypress" />

describe("Authentication", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should open sign in dialog when clicking sign in button", () => {
    cy.contains("Sign In").click();
    cy.get('div[role="dialog"]').should("be.visible");
    cy.contains("Welcome to Civic Portal").should("be.visible");
  });

  it("should switch between sign in and sign up tabs", () => {
    cy.contains("Sign In").click();
    cy.get('div[role="dialog"]').should("be.visible");

    // Check we're on sign in tab
    cy.get('button[value="sign-in"]').should(
      "have.attr",
      "data-state",
      "active",
    );

    // Switch to sign up tab
    cy.get('button[value="sign-up"]').click();
    cy.get('button[value="sign-up"]').should(
      "have.attr",
      "data-state",
      "active",
    );

    // Verify sign up form is visible
    cy.get("form").within(() => {
      cy.get('input[name="email"]').should("exist");
      cy.get('input[name="password"]').should("exist");
      cy.get('input[name="full_name"]').should("exist");
    });
  });

  it("should show validation errors on empty sign in form submission", () => {
    cy.contains("Sign In").click();
    cy.get('div[role="dialog"]').should("be.visible");

    // Try to submit without entering credentials
    cy.get("form").within(() => {
      cy.get('button[type="submit"]').click();
    });

    // Check for validation errors
    cy.contains("Email is required").should("be.visible");
    cy.contains("Password is required").should("be.visible");
  });

  it("should show validation errors on empty sign up form submission", () => {
    cy.contains("Sign In").click();
    cy.get('div[role="dialog"]').should("be.visible");

    // Switch to sign up tab
    cy.get('button[value="sign-up"]').click();

    // Try to submit without entering credentials
    cy.get("form").within(() => {
      cy.get('button[type="submit"]').click();
    });

    // Check for validation errors
    cy.contains("Email is required").should("be.visible");
    cy.contains("Password is required").should("be.visible");
    cy.contains("Full name is required").should("be.visible");
  });

  it("should show forgot password form when clicking forgot password link", () => {
    cy.contains("Sign In").click();
    cy.get('div[role="dialog"]').should("be.visible");

    // Click forgot password link
    cy.contains("Forgot your password?").click();

    // Verify reset password form is visible
    cy.contains("Reset Password").should("be.visible");
    cy.get("form").within(() => {
      cy.get('input[name="email"]').should("exist");
      cy.get('button[type="submit"]').contains("Send Reset Link");
    });

    // Verify can go back to sign in
    cy.contains("Back to Sign In").click();
    cy.get('button[value="sign-in"]').should(
      "have.attr",
      "data-state",
      "active",
    );
  });
});
