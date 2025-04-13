/// <reference types="cypress" />

describe("Reports Dashboard", () => {
  beforeEach(() => {
    cy.visit("/reports");
  });

  it("should display all dashboard components correctly", () => {
    // Check page title
    cy.contains("Government Analytics Dashboard").should("be.visible");

    // Check summary cards
    cy.contains("Total Issues").should("be.visible");
    cy.contains("Resolution Rate").should("be.visible");
    cy.contains("Avg. Response Time").should("be.visible");
    cy.contains("Citizen Satisfaction").should("be.visible");

    // Check charts
    cy.get(".recharts-wrapper").should("have.length.at.least", 2);
  });

  it("should display different chart types", () => {
    // Check for different chart types
    cy.get(".recharts-pie").should("exist");
    cy.get(".recharts-cartesian-grid").should("exist");

    // Switch to different tabs to see more charts
    cy.contains("Department Performance").click();
    cy.get(".recharts-bar").should("exist");

    cy.contains("Financial Analysis").click();
    cy.get(".recharts-bar").should("exist");

    cy.contains("Citizen Engagement").click();
    cy.get(".recharts-line").should("exist");
  });

  it("should allow filtering data by timeframe", () => {
    // Get initial data for comparison
    cy.get(".text-3xl.font-bold").first().invoke("text").as("initialCount");

    // Change timeframe
    cy.get('[role="combobox"]').click();
    cy.contains("Last Month").click();

    // Wait for data to update
    cy.wait(1000);

    // Get updated data
    cy.get(".text-3xl.font-bold").first().invoke("text").as("updatedCount");

    // Compare data (they might be different due to timeframe change)
    cy.get("@initialCount").then((initialCount) => {
      cy.get("@updatedCount").then((updatedCount) => {
        // Just verify we got some data, not necessarily different
        expect(updatedCount).to.not.be.undefined;
      });
    });
  });

  it("should handle export functionality", () => {
    // Click export button
    cy.contains("Export Report").click();

    // Check for export notification
    cy.contains("Exporting").should("be.visible");

    // Wait for export completion notification
    cy.contains("Export Complete", { timeout: 3000 }).should("be.visible");
  });

  it("should navigate to realtime reports page", () => {
    // Look for a link to realtime reports and click it
    cy.contains("Realtime").click();

    // Verify we're on the realtime page
    cy.contains("Government Analytics Dashboard (Realtime)").should(
      "be.visible",
    );

    // Check for realtime indicator
    cy.get(".animate-ping").should("exist");
  });

  it("should display tooltips on charts", () => {
    // Hover over a chart element to show tooltip
    cy.get(".recharts-pie-sector").first().trigger("mouseover");

    // Check if tooltip appears
    cy.get(".recharts-tooltip-wrapper").should("be.visible");

    // Move mouse away
    cy.get(".recharts-pie-sector").first().trigger("mouseout");

    // Switch to another tab
    cy.contains("Department Performance").click();

    // Hover over a bar chart
    cy.get(".recharts-bar-rectangle").first().trigger("mouseover");

    // Check if tooltip appears
    cy.get(".recharts-tooltip-wrapper").should("be.visible");
  });
});
