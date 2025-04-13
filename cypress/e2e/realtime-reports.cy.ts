/// <reference types="cypress" />

describe("Realtime Reports Page", () => {
  beforeEach(() => {
    cy.visit("/reports/realtime");
  });

  it("should display the realtime reports page with charts and live updates", () => {
    cy.contains("Government Analytics Dashboard (Realtime)").should(
      "be.visible",
    );
    cy.get(".recharts-wrapper").should("exist");

    // Check for realtime indicator
    cy.get(".animate-ping").should("exist");
    cy.contains("Last updated:").should("be.visible");
  });

  it("should allow changing timeframe and refresh data", () => {
    // Open the timeframe dropdown
    cy.get('[role="combobox"]').click();

    // Select a different timeframe
    cy.contains("Last Month").click();

    // Verify that the timeframe was changed
    cy.get('[role="combobox"]').should("contain", "Last Month");

    // Wait for data to refresh
    cy.contains("Last updated:").should("be.visible");
  });

  it("should display summary cards with metrics", () => {
    // Check for summary cards
    cy.contains("Total Issues").should("be.visible");
    cy.contains("Resolution Rate").should("be.visible");
    cy.contains("Avg. Response Time").should("be.visible");
    cy.contains("Citizen Satisfaction").should("be.visible");

    // Each card should have a value
    cy.get(".text-3xl.font-bold").should("have.length.at.least", 4);
  });

  it("should navigate between different tabs and display appropriate charts", () => {
    // Check Overview tab (default)
    cy.contains("Overview").should("be.visible");
    cy.contains("Issue Distribution").should("be.visible");
    cy.contains("Monthly Trends").should("be.visible");

    // Switch to Department Performance tab
    cy.contains("Department Performance").click();
    cy.contains("Department Resolution Rates").should("be.visible");
    cy.contains("Response Time by Department").should("be.visible");

    // Switch to Financial Analysis tab
    cy.contains("Financial Analysis").click();
    cy.contains("Budget Allocation vs Spending").should("be.visible");
    cy.contains("Resource Utilization").should("be.visible");

    // Switch to Citizen Engagement tab
    cy.contains("Citizen Engagement").click();
    cy.contains("Citizen Participation Metrics").should("be.visible");
    cy.contains("Satisfaction Trend").should("be.visible");
  });

  it("should handle export report functionality", () => {
    // Click export button
    cy.contains("Export Report").click();

    // Check for export notification
    cy.contains("Exporting").should("be.visible");

    // Wait for export completion notification
    cy.contains("Export Complete", { timeout: 3000 }).should("be.visible");
  });
});
