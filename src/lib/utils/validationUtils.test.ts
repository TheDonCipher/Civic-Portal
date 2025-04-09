import {
  isValidEmail,
  isStrongPassword,
  getPasswordStrength,
  isValidPhoneNumber,
  isValidUrl,
  sanitizeInput,
  isValidFileType,
  isValidFileSize,
} from "./validationUtils";

describe("Validation Utils", () => {
  describe("isValidEmail", () => {
    it("should validate correct email formats", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name+tag@example.co.uk")).toBe(true);
    });

    it("should reject invalid email formats", () => {
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("test@example")).toBe(false);
      expect(isValidEmail("test.example.com")).toBe(false);
    });
  });

  describe("isStrongPassword", () => {
    it("should validate strong passwords", () => {
      expect(isStrongPassword("StrongP@ss1")).toBe(true);
    });

    it("should reject weak passwords", () => {
      expect(isStrongPassword("password")).toBe(false);
      expect(isStrongPassword("12345678")).toBe(false);
      expect(isStrongPassword("Password")).toBe(false);
    });
  });

  describe("getPasswordStrength", () => {
    it("should return correct score for different passwords", () => {
      expect(getPasswordStrength("").score).toBe(0);
      expect(getPasswordStrength("pass").score).toBe(0);
      expect(getPasswordStrength("password1").score).toBe(2);
      expect(getPasswordStrength("Password1").score).toBe(3);
      expect(getPasswordStrength("Password1!").score).toBe(4);
    });

    it("should provide helpful feedback", () => {
      expect(getPasswordStrength("pass").feedback).toContain(
        "at least 8 characters",
      );
      expect(getPasswordStrength("password").feedback).toContain("uppercase");
      expect(getPasswordStrength("Password").feedback).toContain("numbers");
    });
  });

  describe("isValidPhoneNumber", () => {
    it("should validate correct phone formats", () => {
      expect(isValidPhoneNumber("+12345678901")).toBe(true);
      expect(isValidPhoneNumber("12345678901")).toBe(true);
      expect(isValidPhoneNumber("123-456-7890")).toBe(true);
    });

    it("should reject invalid phone formats", () => {
      expect(isValidPhoneNumber("123")).toBe(false);
      expect(isValidPhoneNumber("abcdefghijk")).toBe(false);
    });
  });

  describe("isValidUrl", () => {
    it("should validate correct URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://localhost:3000")).toBe(true);
    });

    it("should reject invalid URLs", () => {
      expect(isValidUrl("example.com")).toBe(false);
      expect(isValidUrl("not a url")).toBe(false);
    });
  });

  describe("sanitizeInput", () => {
    it("should sanitize HTML tags", () => {
      expect(sanitizeInput('<script>alert("XSS")</script>')).not.toContain(
        "<script>",
      );
    });
  });

  describe("isValidFileType", () => {
    it("should validate allowed file types", () => {
      const file = new File([""], "test.jpg", { type: "image/jpeg" });
      expect(isValidFileType(file, ["image/jpeg", "image/png"])).toBe(true);
    });

    it("should reject disallowed file types", () => {
      const file = new File([""], "test.exe", {
        type: "application/x-msdownload",
      });
      expect(isValidFileType(file, ["image/jpeg", "image/png"])).toBe(false);
    });
  });

  describe("isValidFileSize", () => {
    it("should validate files within size limit", () => {
      const file = new File(["test content"], "test.txt");
      expect(isValidFileSize(file, 1024 * 1024)).toBe(true); // 1MB limit
    });

    it("should reject files exceeding size limit", () => {
      const file = new File(["test content"], "test.txt");
      expect(isValidFileSize(file, 5)).toBe(false); // 5 bytes limit
    });
  });
});
