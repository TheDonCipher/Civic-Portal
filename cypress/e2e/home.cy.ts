describe("Home Page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display the home page correctly", () => {
    cy.get("h1").should("contain.text", "Government Issue Tracking Portal");
    cy.contains("Report an Issue").should("exist");
  });

  it("should navigate to issues page", () => {
    cy.contains("View Issues").click();
    cy.url().should("include", "/issues");
  });

  it("should open sign in dialog when clicking on sign in button", () => {
    cy.contains("Sign In").click();
    cy.get('div[role="dialog"]').should("be.visible");
    cy.contains("Sign in to your account").should("be.visible");
  });
});
