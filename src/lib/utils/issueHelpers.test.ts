import { supabase } from "@/lib/supabase";
import {
  getCategoryDefaultImage,
  validateThumbnailUrl,
  toggleIssueVote,
  toggleIssueWatch,
  addComment,
  addUpdate,
  addSolution,
  toggleSolutionVote,
  updateSolutionStatus,
} from "./issueHelpers";

// Mock the supabase client
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
  },
}));

describe("Issue Helper Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCategoryDefaultImage", () => {
    it("should return the correct default image for a category", () => {
      expect(getCategoryDefaultImage("infrastructure")).toContain("city");
      expect(getCategoryDefaultImage("environment")).toContain("green");
      expect(getCategoryDefaultImage("safety")).toContain("police");
      expect(getCategoryDefaultImage("community")).toContain("volunteer");
      expect(getCategoryDefaultImage("unknown")).toContain("city"); // Default fallback
    });
  });

  describe("validateThumbnailUrl", () => {
    it("should return a default image if URL is invalid", () => {
      expect(validateThumbnailUrl("", "infrastructure")).toContain("city");
      expect(validateThumbnailUrl("invalid-url", "environment")).toContain(
        "green",
      );
    });

    it("should return the original URL if valid", () => {
      const validUrl = "https://example.com/image.jpg";
      expect(validateThumbnailUrl(validUrl, "infrastructure")).toBe(validUrl);
    });
  });
});
