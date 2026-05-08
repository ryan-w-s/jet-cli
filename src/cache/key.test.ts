import { describe, expect, test } from "bun:test";

import { buildCacheKey, rootScope, stableStringify } from "./key.js";

describe("stableStringify", () => {
  test("sorts object keys recursively", () => {
    expect(stableStringify({ b: 2, a: { d: 4, c: 3 } })).toBe(
      '{"a":{"c":3,"d":4},"b":2}',
    );
  });

  test("drops undefined object entries", () => {
    expect(stableStringify({ b: undefined, a: 1 })).toBe('{"a":1}');
  });
});

describe("buildCacheKey", () => {
  test("canonicalizes path and query parameter order", () => {
    const left = buildCacheKey({
      apiUrl: "https://api.example.test/",
      apiKeyFingerprint: "abc123",
      method: "GET",
      path: "/api/workspaces/{workspace_slug}/projects",
      pathParams: { workspace_slug: "acme", unused: undefined },
      queryParams: { q: "foo", statusKey: "open" },
    });
    const right = buildCacheKey({
      apiUrl: "https://api.example.test",
      apiKeyFingerprint: "abc123",
      method: "GET",
      path: "/api/workspaces/{workspace_slug}/projects",
      pathParams: { unused: undefined, workspace_slug: "acme" },
      queryParams: { statusKey: "open", q: "foo" },
    });

    expect(left).toBe(right);
  });
});

describe("rootScope", () => {
  test("includes api URL and key fingerprint", () => {
    expect(rootScope("https://api.example.test/", "abc123")).toContain("abc123");
    expect(rootScope("https://api.example.test/", "abc123")).toContain(
      encodeURIComponent("https://api.example.test"),
    );
  });
});
