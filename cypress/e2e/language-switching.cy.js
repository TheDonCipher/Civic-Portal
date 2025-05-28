// cypress/e2e/language-switching.cy.js
describe('Language Switching', () => {
  beforeEach(() => {
    // Clear localStorage to start fresh
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('should display content in English by default', () => {
    // Check that the app title is in English
    cy.contains('Civic Portal').should('be.visible');

    // Check navigation items are in English
    cy.contains('nav a', 'Home').should('be.visible');
    cy.contains('nav a', 'Issues').should('be.visible');
    cy.contains('nav a', 'Reports').should('be.visible');
    cy.contains('nav a', 'About').should('be.visible');

    // Check footer content is in English
    cy.contains('Quick Links').should('be.visible');
    cy.contains('All rights reserved').should('be.visible');
  });

  it('should switch to Setswana when language switcher is clicked', () => {
    // Find and click the language switcher
    cy.get('[aria-label*="Current language"]').click();

    // Click on Setswana option
    cy.contains('Setswana').click();

    // Wait for language change to take effect
    cy.wait(500);

    // Check that the app title is now in Setswana
    cy.contains('Lephata la Baagi').should('be.visible');

    // Check navigation items are in Setswana
    cy.contains('nav a', 'Tshimologo').should('be.visible');
    cy.contains('nav a', 'Dikgang').should('be.visible');
    cy.contains('nav a', 'Dipego').should('be.visible');
    cy.contains('nav a', 'Ka Rona').should('be.visible');

    // Check footer content is in Setswana
    cy.contains('Dikgokagano tse di Bonako').should('be.visible');
    cy.contains('Ditshwanelo tsotlhe di sireletsegile').should('be.visible');
  });

  it('should persist language choice in localStorage', () => {
    // Switch to Setswana
    cy.get('[aria-label*="Current language"]').click();
    cy.contains('Setswana').click();
    cy.wait(500);

    // Reload the page
    cy.reload();

    // Check that Setswana is still active
    cy.contains('Lephata la Baagi').should('be.visible');
    cy.contains('nav a', 'Tshimologo').should('be.visible');
  });

  it('should switch back to English', () => {
    // First switch to Setswana
    cy.get('[aria-label*="Current language"]').click();
    cy.contains('Setswana').click();
    cy.wait(500);

    // Then switch back to English
    cy.get('[aria-label*="Current language"]').click();
    cy.contains('Sekgoa').click(); // Use Setswana word for English
    cy.wait(500);

    // Check that content is back in English
    cy.contains('Civic Portal').should('be.visible');
    cy.contains('nav a', 'Home').should('be.visible');
    cy.contains('Quick Links').should('be.visible');
  });

  it('should show language switcher in mobile menu', () => {
    // Set mobile viewport
    cy.viewport(375, 667);

    // Open mobile menu - look for the mobile menu button
    cy.get('button.md\\:hidden').click();

    // Check that language switcher is present in mobile menu
    cy.contains('English / Setswana').should('be.visible');

    // Test language switching in mobile menu
    cy.get('[aria-label*="Current language"]').click();
    cy.contains('Setswana').click();
    cy.wait(500);

    // Check that content changed to Setswana
    cy.contains('Lephata la Baagi').should('be.visible');
  });
});
