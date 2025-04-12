import { getReportData, timeframeToMonths } from "./statsApi";
import { supabase } from "@/lib/supabase";
import type { ReportData } from "@/types/supabase-extensions";

// Add Jest types
import { jest, describe, beforeEach, it, expect } from "@jest/globals";

// Mock the supabase client
jest.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    group: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  },
}));

// Mock the statsHelpers functions
jest.mock("./statsHelpers", () => ({
  fetchTotalIssuesCount: jest.fn().mockResolvedValue(100),
  fetchEngagementStats: jest.fn().mockResolvedValue({
    votesPerIssue: 5,
    commentsPerIssue: 3,
  }),
}));

describe("statsApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getReportData", () => {
    it("should use RPC data when available", async () => {
      const mockRpcData: ReportData = {
        issuesByCategory: [
          { name: "Infrastructure", value: 25, previousValue: 20 },
        ],
        issuesByStatus: [{ name: "Open", value: 30, previousValue: 25 }],
        monthlyTrends: [
          { month: "Jan", issues: 10, resolved: 5, responseTime: 3.5 },
        ],
        departmentPerformance: [],
        budgetAllocation: [],
        citizenEngagement: [],
      };

      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: mockRpcData,
        error: null,
      });

      const result = await getReportData("3m");

      expect(supabase.rpc).toHaveBeenCalledWith("get_report_data", {
        time_frame: "3m",
      });
      expect(result).toEqual(mockRpcData);
    });

    it("should fall back to client-side aggregation when RPC fails", async () => {
      // Mock RPC failure
      (supabase.rpc as jest.Mock).mockImplementation((funcName) => {
        if (funcName === "get_report_data") {
          return Promise.resolve({
            data: null,
            error: { message: "Function not found" },
          });
        } else if (funcName === "get_monthly_issue_stats") {
          return Promise.resolve({
            data: [
              { month: "Jan", issues: 10, resolved: 5 },
              { month: "Feb", issues: 15, resolved: 8 },
            ],
            error: null,
          });
        } else {
          return Promise.resolve({ data: 0, error: null });
        }
      });

      // Mock category data
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        group: jest.fn().mockResolvedValue({
          data: [
            { category: "Infrastructure", count: "25" },
            { category: "Environment", count: "15" },
          ],
          error: null,
        }),
      }));

      const result = await getReportData("3m");

      expect(supabase.rpc).toHaveBeenCalledWith("get_report_data", {
        time_frame: "3m",
      });
      expect(result).toHaveProperty("issuesByCategory");
      expect(result).toHaveProperty("issuesByStatus");
      expect(result).toHaveProperty("monthlyTrends");
    });
  });

  describe("timeframeToMonths", () => {
    it("should convert timeframe strings to months", () => {
      expect(timeframeToMonths("1m")).toBe(1);
      expect(timeframeToMonths("3m")).toBe(3);
      expect(timeframeToMonths("6m")).toBe(6);
      expect(timeframeToMonths("1y")).toBe(12);
      expect(timeframeToMonths("invalid")).toBe(3); // default
    });
  });
});
