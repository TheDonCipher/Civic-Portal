/// <reference types="cypress" />

describe("Reports Page", () => {
  beforeEach(() => {
    cy.visit("/reports");
  });

  it("should display the reports page with charts", () => {
    cy.contains("Government Analytics Dashboard").should("be.visible");
    cy.get(".recharts-wrapper").should("exist");
  });

  it("should allow changing timeframe", () => {
    // Open the timeframe dropdown
    cy.get('[role="combobox"]').click();

    // Select a different timeframe
    cy.contains("Last Month").click();

    // Verify that the timeframe was changed
    cy.get('[role="combobox"]').should("contain", "Last Month");
  });

  it("should display different tabs with charts", () => {
    // Check Overview tab
    cy.contains("Overview").should("be.visible");
    cy.get(".recharts-wrapper").should("exist");

    // Switch to Department Performance tab
    cy.contains("Department Performance").click();
    cy.get(".recharts-wrapper").should("exist");

    // Switch to Financial Analysis tab
    cy.contains("Financial Analysis").click();
    cy.get(".recharts-wrapper").should("exist");

    // Switch to Citizen Engagement tab
    cy.contains("Citizen Engagement").click();
    cy.get(".recharts-wrapper").should("exist");
  });

  it("should show export report functionality", () => {
    cy.contains("Export Report").click();
    cy.contains("Exporting").should("be.visible");
  });
});
