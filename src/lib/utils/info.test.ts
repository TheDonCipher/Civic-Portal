import {
  getAppVersion,
  getEnvironmentInfo,
  getFeatureFlags,
  getAppInfo,
} from "./info";

describe("Info Utilities", () => {
  describe("getAppVersion", () => {
    it("should return a valid version string", () => {
      const version = getAppVersion();
      expect(typeof version).toBe("string");
      expect(version).toBe("1.0.0");
    });
  });

  describe("getEnvironmentInfo", () => {
    it("should return environment information", () => {
      const envInfo = getEnvironmentInfo();
      expect(envInfo).toHaveProperty("isDevelopment");
      expect(envInfo).toHaveProperty("isProduction");
      expect(envInfo).toHaveProperty("isTest");
    });
  });

  describe("getFeatureFlags", () => {
    it("should return feature flags", () => {
      const flags = getFeatureFlags();
      expect(flags).toHaveProperty("enableMultipleImages");
      expect(flags).toHaveProperty("enableRealtime");
      expect(flags).toHaveProperty("enableVoting");
      expect(flags).toHaveProperty("enableWatching");
      expect(flags).toHaveProperty("enableSolutions");
    });
  });

  describe("getAppInfo", () => {
    it("should return combined app information", () => {
      const appInfo = getAppInfo();
      expect(appInfo).toHaveProperty("name");
      expect(appInfo).toHaveProperty("version");
      expect(appInfo).toHaveProperty("environment");
      expect(appInfo).toHaveProperty("features");
      expect(appInfo.name).toBe("Civic Portal");
    });
  });
});
