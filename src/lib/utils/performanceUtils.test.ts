import {
  cacheData,
  getCachedData,
  clearCache,
  debounce,
  throttle,
  measurePerformance,
} from "./performanceUtils";

describe("Performance Utilities", () => {
  beforeEach(() => {
    // Clear the cache before each test
    clearCache();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("cacheData and getCachedData", () => {
    it("should store and retrieve data from cache", () => {
      const testData = { test: "data" };
      cacheData("test-key", testData);
      expect(getCachedData("test-key")).toEqual(testData);
    });

    it("should return null for expired cache items", () => {
      const testData = { test: "data" };
      cacheData("test-key", testData, 0.01); // Very short TTL (10ms)

      // Fast-forward time
      jest.advanceTimersByTime(20);

      expect(getCachedData("test-key")).toBeNull();
    });

    it("should handle invalid cache keys", () => {
      expect(getCachedData("")).toBeNull();
      expect(getCachedData(null as any)).toBeNull();
    });
  });

  describe("clearCache", () => {
    it("should clear all cache items", () => {
      cacheData("key1", "value1");
      cacheData("key2", "value2");
      clearCache();
      expect(getCachedData("key1")).toBeNull();
      expect(getCachedData("key2")).toBeNull();
    });

    it("should clear cache items matching a pattern", () => {
      cacheData("test-key1", "value1");
      cacheData("test-key2", "value2");
      cacheData("other-key", "value3");
      clearCache("test");
      expect(getCachedData("test-key1")).toBeNull();
      expect(getCachedData("test-key2")).toBeNull();
      expect(getCachedData("other-key")).toEqual("value3");
    });
  });

  describe("debounce", () => {
    it("should debounce function calls", async () => {
      const mockFn = jest.fn().mockReturnValue("result");
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(110);
      await Promise.resolve(); // Allow any pending promises to resolve

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("throttle", () => {
    it("should throttle function calls", () => {
      const mockFn = jest.fn().mockReturnValue("result");
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(110);

      throttledFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("measurePerformance", () => {
    it("should measure and log function performance", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const mockFn = jest.fn().mockResolvedValue("result");

      const result = await measurePerformance(mockFn, "test-function");

      expect(result).toBe("result");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Performance [test-function]"),
      );

      consoleSpy.mockRestore();
    });

    it("should handle and log errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = new Error("Test error");
      const mockFn = jest.fn().mockRejectedValue(mockError);

      await expect(
        measurePerformance(mockFn, "error-function"),
      ).rejects.toThrow("Test error");

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Performance [error-function] ERROR"),
        mockError,
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
