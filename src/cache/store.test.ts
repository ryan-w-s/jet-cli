import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { JsonCacheStore } from "./store.js";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((path) => rm(path, { recursive: true })));
});

describe("JsonCacheStore", () => {
  test("returns fresh entries and prunes stale entries on read", async () => {
    const store = await makeStore();
    await store.set({
      key: "fresh",
      scope: "scope",
      createdAt: 100,
      expiresAt: 200,
      status: 200,
      headers: {},
      body: { ok: true },
    });

    expect(await store.get("fresh", 150)).toMatchObject({ body: { ok: true } });
    expect(await store.get("fresh", 250)).toBeUndefined();
  });

  test("clears by scope prefix", async () => {
    const store = await makeStore();
    await store.set(entry("one", "root/workspace/acme"));
    await store.set(entry("two", "root/workspace/acme/projects"));
    await store.set(entry("three", "root/workspace/beta"));

    expect(await store.clear({ scopePrefix: "root/workspace/acme" })).toBe(2);
    expect((await store.stats()).entryCount).toBe(1);
  });

  test("reports stats and prunes expired entries", async () => {
    const store = await makeStore();
    await store.set(entry("expired", "scope", 50));
    await store.set(entry("fresh", "scope", 200));

    expect((await store.stats(100)).expiredEntryCount).toBe(1);
    expect(await store.prune(100)).toBe(1);
    expect((await store.stats(100)).entryCount).toBe(1);
  });

  test("replaces an existing cache file on repeated writes", async () => {
    const store = await makeStore();
    await store.set(entry("first", "scope"));
    await store.set(entry("second", "scope"));

    expect((await store.stats()).entryCount).toBe(2);
  });

  test("serializes overlapping writes for stores sharing a cache file", async () => {
    const store = await makeStore();
    const first = new JsonCacheStore(store.path);
    const second = new JsonCacheStore(store.path);

    await Promise.all([
      first.set(entry("first", "scope")),
      second.set(entry("second", "scope")),
      store.set(entry("third", "scope")),
    ]);

    expect((await store.stats()).entryCount).toBe(3);
    expect(await store.get("first")).toMatchObject({ body: { key: "first" } });
    expect(await store.get("second")).toMatchObject({ body: { key: "second" } });
    expect(await store.get("third")).toMatchObject({ body: { key: "third" } });
  });

  test.skipIf(process.platform === "win32")("writes cache files with private POSIX permissions", async () => {
    const store = await makeStore();
    await store.set(entry("private", "scope"));

    expect((await stat(store.path)).mode & 0o777).toBe(0o600);
  });
});

async function makeStore(): Promise<JsonCacheStore> {
  const dir = await mkdtemp(join(tmpdir(), "jet-cli-cache-"));
  tempDirs.push(dir);
  return new JsonCacheStore(join(dir, "cache.json"));
}

function entry(key: string, scope: string, expiresAt = Date.now() + 60_000) {
  return {
    key,
    scope,
    createdAt: 0,
    expiresAt,
    status: 200,
    headers: {},
    body: { key },
  };
}
