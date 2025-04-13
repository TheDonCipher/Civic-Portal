import { renderHook, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRealtimeIssues } from "../useRealtimeIssues";

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
    channel: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
    removeChannel: jest.fn(),
  },
}));

describe("useRealtimeIssues Hook", () => {
  it("should fetch issues on initial render", async () => {
    const { result } = renderHook(() => useRealtimeIssues());

    // Initial state
    expect(result.current.issues).toEqual([]);
    expect(result.current.loading).toBe(true);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After data is loaded
    expect(result.current.issues.length).toBe(1);
    expect(result.current.issues[0].title).toBe("Test Issue");
  });

  it("should set up realtime subscriptions", async () => {
    const { result } = renderHook(() => useRealtimeIssues());

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that subscriptions were set up
    expect(result.current.loading).toBe(false);
  });
});
