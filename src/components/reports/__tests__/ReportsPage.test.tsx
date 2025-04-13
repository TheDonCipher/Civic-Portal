import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ReportsPageWithRealtime } from "../ReportsPageWithRealtime";
import { BrowserRouter } from "react-router-dom";

// Mock the getReportData function
jest.mock("@/lib/api/statsApi", () => ({
  getReportData: jest.fn().mockResolvedValue({
    issuesByCategory: [
      { name: "Infrastructure", value: 25, previousValue: 20 },
      { name: "Environment", value: 15, previousValue: 12 },
    ],
    issuesByStatus: [
      { name: "Open", value: 30, previousValue: 25 },
      { name: "Resolved", value: 10, previousValue: 8 },
    ],
    monthlyTrends: [
      { month: "Jan", issues: 10, resolved: 5, responseTime: 3.5 },
      { month: "Feb", issues: 15, resolved: 8, responseTime: 3.2 },
    ],
    departmentPerformance: [
      { name: "Infrastructure", resolutionRate: 78, avgResponseDays: 3.2 },
      { name: "Environment", resolutionRate: 65, avgResponseDays: 4.5 },
    ],
    budgetAllocation: [
      { category: "Infrastructure", allocated: 120000, spent: 95000 },
      { category: "Environment", allocated: 80000, spent: 62000 },
    ],
    citizenEngagement: [
      { month: "Jan", votes: 50, comments: 30, satisfaction: 75 },
      { month: "Feb", votes: 60, comments: 40, satisfaction: 80 },
    ],
  }),
}));

// Mock the supabase client
jest.mock("@/lib/supabase", () => ({
  supabase: {
    channel: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
    removeChannel: jest.fn(),
  },
}));

describe("ReportsPage Component", () => {
  it("renders the reports page with charts", async () => {
    render(
      <BrowserRouter>
        <ReportsPageWithRealtime />
      </BrowserRouter>,
    );

    // Check if the title is rendered
    expect(
      screen.getByText("Government Analytics Dashboard (Realtime)"),
    ).toBeInTheDocument();

    // Wait for the data to load and check if summary cards are rendered
    await waitFor(() => {
      expect(screen.getByText("Total Issues")).toBeInTheDocument();
      expect(screen.getByText("Resolution Rate")).toBeInTheDocument();
      expect(screen.getByText("Avg. Response Time")).toBeInTheDocument();
      expect(screen.getByText("Citizen Satisfaction")).toBeInTheDocument();
    });

    // Check if tabs are rendered
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Department Performance" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Financial Analysis" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Citizen Engagement" }),
    ).toBeInTheDocument();
  });
});
