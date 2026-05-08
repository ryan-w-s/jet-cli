import { describe, expect, test } from "bun:test";

import { normalizeConfigKey } from "./config.js";

describe("normalizeConfigKey", () => {
  test("accepts camelCase and kebab-case config keys", () => {
    expect(normalizeConfigKey("apiUrl")).toBe("apiUrl");
    expect(normalizeConfigKey("api-url")).toBe("apiUrl");
    expect(normalizeConfigKey("api-key")).toBe("apiKey");
    expect(normalizeConfigKey("workspace")).toBe("workspace");
    expect(normalizeConfigKey("project")).toBe("project");
    expect(normalizeConfigKey("output")).toBe("output");
    expect(normalizeConfigKey("cache")).toBe("cache");
  });

  test("rejects unknown config keys", () => {
    expect(() => normalizeConfigKey("base-url")).toThrow(
      'Unknown config key "base-url".',
    );
  });
});
