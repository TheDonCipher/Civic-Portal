import {
  handleApiError,
  handleFormError,
  handleAuthError,
  handleNetworkError,
} from "./errorHandler";

// Mock the toast function
jest.mock("@/components/ui/use-toast-enhanced", () => ({
  toast: jest.fn(),
}));

describe("Error Handler", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock console.error to prevent cluttering test output
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("handleApiError", () => {
    it("should log errors to console", () => {
      const error = new Error("API error");
      handleApiError(error, { showToast: false });
      expect(console.error).toHaveBeenCalled();
    });

    it("should extract error details", () => {
      const error = {
        message: "API error",
        code: "ERR_API",
        status: 400,
      };
      handleApiError(error, { showToast: false });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("API Request"),
        expect.objectContaining({
          message: "API error",
          code: "ERR_API",
          status: 400,
        }),
      );
    });
  });

  describe("handleFormError", () => {
    it("should handle Zod-like validation errors", () => {
      const error = {
        errors: [
          { path: ["name"], message: "Name is required" },
          { path: ["email"], message: "Invalid email" },
        ],
      };
      handleFormError(error, { showToast: false });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("handleAuthError", () => {
    it("should log authentication errors", () => {
      const error = new Error("Auth failed");
      handleAuthError(error, { showToast: false });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Authentication"),
        error,
      );
    });
  });

  describe("handleNetworkError", () => {
    it("should log network errors", () => {
      const error = new Error("Network error");
      handleNetworkError(error, { showToast: false });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Network Request"),
        error,
      );
    });
  });
});
