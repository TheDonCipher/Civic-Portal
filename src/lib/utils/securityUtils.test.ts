import {
  sanitizeInput,
  verifyAuthentication,
  hasPermission,
} from "./securityUtils";
import { supabase } from "@/lib/supabase";

// Mock the supabase client
jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe("Security Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sanitizeInput", () => {
    it("should sanitize HTML special characters", () => {
      const input = '<script>alert("XSS");</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain("<script>");
      expect(sanitized).toContain("&lt;script&gt;");
    });

    it("should handle empty input", () => {
      expect(sanitizeInput("")).toBe("");
      expect(sanitizeInput(null as any)).toBe("");
      expect(sanitizeInput(undefined as any)).toBe("");
    });
  });

  describe("verifyAuthentication", () => {
    it("should return true when user is authenticated", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: { user: { id: "123" } } },
        error: null,
      });

      const result = await verifyAuthentication();
      expect(result).toBe(true);
    });

    it("should return false when user is not authenticated", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await verifyAuthentication();
      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: new Error("Auth error"),
      });

      const result = await verifyAuthentication();
      expect(result).toBe(false);
    });
  });

  describe("hasPermission", () => {
    it("should return true for officials", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "123" } },
        error: null,
      });

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: "official" },
          error: null,
        }),
      }));

      const result = await hasPermission("issue", "456", "update");
      expect(result).toBe(true);
    });

    it("should return true for resource owners", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "123" } },
        error: null,
      });

      // Mock profile query
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: "citizen" },
          error: null,
        }),
      }));

      // Mock resource query
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { author_id: "123" },
          error: null,
        }),
      }));

      const result = await hasPermission("issue", "456", "update");
      expect(result).toBe(true);
    });

    it("should return false for unauthorized users", async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "123" } },
        error: null,
      });

      // Mock profile query
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: "citizen" },
          error: null,
        }),
      }));

      // Mock resource query
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { author_id: "456" }, // Different user
          error: null,
        }),
      }));

      const result = await hasPermission("issue", "456", "update");
      expect(result).toBe(false);
    });
  });
});
