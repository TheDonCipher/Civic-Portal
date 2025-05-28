/// <reference types="cypress" />

// Import commands from Testing Library
import "@testing-library/cypress/add-commands";

// Custom command to login programmatically
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit("/");
    cy.contains("Sign In").click();
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Wait for authentication to complete and verify user is logged in
    cy.get('div[role="dialog"]', { timeout: 10000 }).should("not.exist");
    cy.get("header").contains("Profile").should("be.visible");
  });
});

// Custom command to logout
Cypress.Commands.add("logout", () => {
  cy.get("header").contains("Profile").click();
  cy.contains("Sign Out").click();
  cy.contains("Sign In").should("be.visible");
});

// Custom command to sign up a new user
Cypress.Commands.add(
  "signup",
  (email: string, password: string, fullName: string) => {
    cy.visit("/");
    cy.contains("Sign In").click();

    // Switch to sign up tab
    cy.get('button[value="sign-up"]').click();

    // Fill out the form
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('input[name="full_name"]').type(fullName);

    // Select a constituency if the field exists
    cy.get("body").then(($body) => {
      if ($body.find('button:contains("Select constituency")').length > 0) {
        cy.get('button:contains("Select constituency")').click();
        cy.get('div[role="option"]').first().click();
      }
    });

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Verify success message
    cy.contains("Account created successfully").should("be.visible", {
      timeout: 10000,
    });
  },
);

// Custom command to create an issue
Cypress.Commands.add(
  "createIssue",
  (title: string, description: string, category: string) => {
    cy.visit("/issues");
    cy.contains("Report Issue").click();
    cy.get('input[name="title"]').type(title);
    cy.get('textarea[name="description"]').type(description);
    cy.get('select[name="category"]').select(category);
    cy.get('button[type="submit"]').click();
    cy.contains("Issue Reported Successfully").should("be.visible");
  },
);

// Language switching commands
Cypress.Commands.add('setLanguage', (language: 'en' | 'tn') => {
  cy.window().then((win) => {
    win.localStorage.setItem('i18nextLng', language);
  });
});

Cypress.Commands.add('switchToLanguage', (language: 'English' | 'Setswana') => {
  cy.get('[aria-label*="Current language"]').click();
  cy.contains(language).click();
  cy.wait(500); // Wait for language change to take effect
});

// Declare global Cypress namespace to add custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      signup(
        email: string,
        password: string,
        fullName: string,
      ): Chainable<void>;
      createIssue(
        title: string,
        description: string,
        category: string,
      ): Chainable<void>;
      setLanguage(language: 'en' | 'tn'): Chainable<void>;
      switchToLanguage(language: 'English' | 'Setswana'): Chainable<void>;
    }
  }
}
