import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { JetApi, JetApiError, trimTrailingSlash, unwrap } from "./client.js";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((path) => rm(path, { recursive: true })));
});

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

describe("JetApi cache", () => {
  test("reuses cacheable GET responses by api URL and API key fingerprint", async () => {
    const cacheFile = await makeCacheFile();
    let calls = 0;
    const api = new JetApi({
      apiUrl: "https://api.example.test",
      apiKey: "jet_secret",
      cacheFile,
      fetch: async () => {
        calls += 1;
        return Response.json([{ id: "workspace-id", slug: "acme", name: "Acme" }]);
      },
    });

    await api.listWorkspaces();
    await api.listWorkspaces();

    expect(calls).toBe(1);
  });

  test("refresh bypasses cached reads and writes the fresh response", async () => {
    const cacheFile = await makeCacheFile();
    let calls = 0;
    const fetch = async () => {
      calls += 1;
      return Response.json([{ id: `workspace-${calls}`, slug: "acme", name: "Acme" }]);
    };
    const baseOptions = {
      apiUrl: "https://api.example.test",
      apiKey: "jet_secret",
      cacheFile,
      fetch,
    };
    await new JetApi(baseOptions).listWorkspaces();
    const refreshed = await new JetApi({ ...baseOptions, cacheRefresh: true }).listWorkspaces();
    const cached = await new JetApi(baseOptions).listWorkspaces();

    expect(calls).toBe(2);
    expect(refreshed[0]?.id).toBe("workspace-2");
    expect(cached[0]?.id).toBe("workspace-2");
  });

  test("no-cache bypasses reads and writes", async () => {
    const cacheFile = await makeCacheFile();
    let calls = 0;
    const api = new JetApi({
      apiUrl: "https://api.example.test",
      apiKey: "jet_secret",
      cache: "off",
      cacheFile,
      fetch: async () => {
        calls += 1;
        return Response.json([{ id: `workspace-${calls}`, slug: "acme", name: "Acme" }]);
      },
    });

    await api.listWorkspaces();
    await api.listWorkspaces();

    expect(calls).toBe(2);
  });
});

async function makeCacheFile(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "jet-cli-api-cache-"));
  tempDirs.push(dir);
  return join(dir, "cache.json");
}
