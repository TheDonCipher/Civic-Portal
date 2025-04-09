import {
  getCategoryDefaultImage,
  validateThumbnailUrl,
  uploadImageToStorage,
  verifyImageUrl,
  getDataUrlFromFile,
} from "./imageUpload";
import { supabase } from "@/lib/supabase";

// Mock the supabase client
jest.mock("@/lib/supabase", () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    },
  },
}));

describe("Image Upload Utilities", () => {
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

  describe("uploadImageToStorage", () => {
    it("should upload an image and return the public URL", async () => {
      // Mock file
      const file = new File(["dummy content"], "test.jpg", {
        type: "image/jpeg",
      });

      // Mock successful upload
      (supabase.storage.from().upload as jest.Mock).mockResolvedValue({
        data: { path: "issue-images/test.jpg" },
        error: null,
      });

      // Mock public URL
      (supabase.storage.from().getPublicUrl as jest.Mock).mockReturnValue({
        data: { publicUrl: "https://example.com/test.jpg" },
      });

      // Mock image verification
      global.Image = class {
        onload: () => void = () => {};
        onerror: () => void = () => {};
        src: string = "";

        constructor() {
          setTimeout(() => this.onload(), 10);
        }
      };

      const result = await uploadImageToStorage(file);
      expect(result).toBe("https://example.com/test.jpg");
      expect(supabase.storage.from().upload).toHaveBeenCalled();
    });
  });
});
