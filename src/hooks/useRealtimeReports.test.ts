import { renderHook, act, waitFor } from "@testing-library/react";
import { useRealtimeReports } from "./useRealtimeReports";
import { getReportData } from "@/lib/api/statsApi";
import { supabase } from "@/lib/supabase";
import type { ReportData } from "@/types/supabase-extensions";
import { jest, describe, beforeEach, it, expect } from "@jest/globals";

// Mock dependencies
jest.mock("@/lib/api/statsApi", () => ({
  getReportData: jest.fn(),
}));

jest.mock("@/lib/supabase", () => ({
  supabase: {
    channel: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
    removeChannel: jest.fn(),
  },
}));

jest.mock("@/components/ui/use-toast-enhanced", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe("useRealtimeReports", () => {
  const mockReportData: ReportData = {
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
    departmentPerformance: [],
    budgetAllocation: [],
    citizenEngagement: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getReportData as jest.Mock).mockResolvedValue(mockReportData);
  });

  it("should fetch report data on initial render", async () => {
    const { result } = renderHook(() => useRealtimeReports("3m"));

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.reportData).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After data is loaded
    expect(result.current.reportData).toEqual(mockReportData);
    expect(result.current.timeframe).toBe("3m");
    expect(getReportData).toHaveBeenCalledWith("3m");
  });

  it("should update timeframe and fetch new data", async () => {
    const { result } = renderHook(() => useRealtimeReports("3m"));

    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Change timeframe
    act(() => {
      result.current.setTimeframe("6m");
    });

    // Should be loading again
    expect(result.current.loading).toBe(true);

    // Wait for new data
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After new data is loaded
    expect(result.current.timeframe).toBe("6m");
    expect(getReportData).toHaveBeenCalledWith("6m");
  });

  it("should set up realtime subscriptions", async () => {
    const { result } = renderHook(() => useRealtimeReports());

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Check that subscriptions were set up
    expect(supabase.channel).toHaveBeenCalledWith("reports-realtime-updates");
    expect(supabase.on).toHaveBeenCalledTimes(3); // Three subscriptions (issues, comments, votes)
    expect(supabase.subscribe).toHaveBeenCalled();
  });

  it("should handle manual refresh", async () => {
    const { result } = renderHook(() => useRealtimeReports("3m"));

    // Wait for initial data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Reset mock to track new calls
    (getReportData as jest.Mock).mockClear();

    // Manually refresh data
    act(() => {
      result.current.refreshData();
    });

    // Should be loading again
    expect(result.current.loading).toBe(true);

    // Wait for refresh to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // After refresh is complete
    expect(getReportData).toHaveBeenCalledWith("3m");
  });
});
