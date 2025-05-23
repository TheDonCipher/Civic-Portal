import { getIssueWithDetails, getIssues } from "../dbFunctions";
import { supabase } from "@/lib/supabase";

// Mock the supabase client
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: {
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
      error: null,
    }),
  },
}));

describe("Database Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getIssueWithDetails", () => {
    it("should fetch issue details with related data", async () => {
      // Mock implementation for comments, updates, and solutions
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === "comments") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: [
                {
                  id: "c1",
                  content: "Test comment",
                  created_at: new Date().toISOString(),
                  author_id: "user2",
                  profiles: { full_name: "Comment User", avatar_url: null },
                },
              ],
              error: null,
            }),
          };
        } else if (table === "updates") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: [
                {
                  id: "u1",
                  content: "Test update",
                  created_at: new Date().toISOString(),
                  author_id: "user3",
                  type: "status",
                  profiles: { full_name: "Update User", avatar_url: null },
                },
              ],
              error: null,
            }),
          };
        } else if (table === "solutions") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: [
                {
                  id: "s1",
                  title: "Test solution",
                  description: "Solution description",
                  created_at: new Date().toISOString(),
                  proposed_by: "user4",
                  estimated_cost: 1000,
                  votes: 3,
                  status: "proposed",
                  profiles: { full_name: "Solution User", avatar_url: null },
                },
              ],
              error: null,
            }),
          };
        } else {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
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
              error: null,
            }),
          };
        }
      });

      const result = await getIssueWithDetails("1");

      // Check that the issue and related data are returned
      expect(result).toHaveProperty("issue");
      expect(result).toHaveProperty("comments");
      expect(result).toHaveProperty("updates");
      expect(result).toHaveProperty("solutions");

      expect(result.issue.title).toBe("Test Issue");
      expect(result.comments.length).toBe(1);
      expect(result.updates.length).toBe(1);
      expect(result.solutions.length).toBe(1);
    });
  });

  describe("getIssues", () => {
    it("should fetch issues with pagination", async () => {
      // Mock implementation for getIssues
      (supabase.from as jest.Mock).mockImplementation(() => ({
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
      }));

      const result = await getIssues(
        undefined,
        undefined,
        undefined,
        undefined,
        "created_at",
        "desc",
        10,
        0,
        1,
        10,
      );

      // Check that the issues are returned with pagination info
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("count");
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("limit");
      expect(result).toHaveProperty("totalPages");

      expect(result.data.length).toBe(1);
      expect(result.data[0].title).toBe("Test Issue");
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});
