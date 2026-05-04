import { describe, expect, test } from "bun:test";

import { JetApiError, trimTrailingSlash, unwrap } from "./client.js";

describe("trimTrailingSlash", () => {
  test("removes all trailing slashes", () => {
    expect(trimTrailingSlash("http://127.0.0.1:8000///")).toBe(
      "http://127.0.0.1:8000",
    );
    expect(trimTrailingSlash("http://127.0.0.1:8000/api")).toBe(
      "http://127.0.0.1:8000/api",
    );
  });
});

describe("unwrap", () => {
  test("returns response data when present", () => {
    const data = { id: "workspace-id" };

    expect(unwrap(data, undefined, new Response(null, { status: 200 }))).toBe(data);
  });

  test("allows successful empty 204 responses", () => {
    expect(unwrap<void>(undefined, undefined, new Response(null, { status: 204 }))).toBe(
      undefined,
    );
  });

  test("throws when a non-empty response has no body", () => {
    expect(() => unwrap(undefined, undefined, new Response(null, { status: 200 }))).toThrow(
      new JetApiError("API response did not include a body.", 200, undefined),
    );
  });

  test("uses string API error details as messages", () => {
    try {
      unwrap(undefined, { detail: "Forbidden" }, new Response(null, { status: 403 }));
      throw new Error("Expected JetApiError.");
    } catch (error) {
      expect(error).toBeInstanceOf(JetApiError);
      expect((error as JetApiError).message).toBe("Forbidden");
      expect((error as JetApiError).status).toBe(403);
      expect((error as JetApiError).detail).toEqual({ detail: "Forbidden" });
    }
  });

  test("serializes structured API error details", () => {
    expect(() =>
      unwrap(
        undefined,
        { detail: [{ msg: "Value is required" }] },
        new Response(null, { status: 422 }),
      ),
    ).toThrow('[{"msg":"Value is required"}]');
  });

  test("falls back to a generic HTTP error message", () => {
    expect(() =>
      unwrap(undefined, { message: "unexpected" }, new Response(null, { status: 500 })),
    ).toThrow("JET API request failed with HTTP 500.");
  });
});
