import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom"; // Import jest-dom for the matchers
import IssueGrid from "../IssueGrid";
import { BrowserRouter } from "react-router-dom";

// Mock the supabase client
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockResolvedValue({
      data: [
        {
          id: "1",
          title: "Test Issue",
          description: "Test Description",
          category: "Infrastructure",
          status: "open",
          votes: 5,
          created_at: new Date().toISOString(),
          author_id: "user1",
          author_name: "Test User",
          location: "Test Location",
          constituency: "Test Constituency",
          watchers_count: 3,
        },
      ],
      count: 1,
      error: null,
    }),
  },
}));

// Mock the useAuth hook
jest.mock("@/lib/auth", () => ({
  useAuth: () => ({
    user: { id: "user1" },
    profile: { full_name: "Test User" },
    isLoading: false,
  }),
}));

// Mock the IssueGrid props
const mockOnIssueClick = jest.fn();

describe("IssueGrid Component", () => {
  it("renders the issue grid with issue cards", async () => {
    render(
      <BrowserRouter>
        <IssueGrid onIssueClick={mockOnIssueClick} />
      </BrowserRouter>,
    );

    // Wait for the issues to load
    const issueTitle = await screen.findByText("Test Issue");
    expect(issueTitle).toBeInTheDocument();

    // Check if the filter bar is rendered
    expect(screen.getByPlaceholderText("Search issues...")).toBeInTheDocument();

    // Check if the issue card is rendered with correct information
    expect(screen.getByText("Infrastructure")).toBeInTheDocument();
    expect(screen.getByText("Test Location")).toBeInTheDocument();
  });

  it("allows filtering issues", async () => {
    render(
      <BrowserRouter>
        <IssueGrid onIssueClick={mockOnIssueClick} />
      </BrowserRouter>,
    );

    // Wait for the issues to load
    await screen.findByText("Test Issue");

    // Type in the search box
    const searchInput = screen.getByPlaceholderText("Search issues...");
    fireEvent.change(searchInput, { target: { value: "Test" } });

    // Check if the search was applied
    expect(searchInput).toHaveValue("Test");
  });
});
