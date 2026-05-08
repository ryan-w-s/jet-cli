import { existsSync } from "node:fs";
import { mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname } from "node:path";

export type CacheEntry = {
  key: string;
  scope: string;
  createdAt: number;
  expiresAt: number;
  status: number;
  headers: Record<string, string>;
  body: unknown;
};

export type CacheStats = {
  path: string;
  entryCount: number;
  expiredEntryCount: number;
  approximateBytes: number;
  oldestExpiresAt: number | null;
  newestExpiresAt: number | null;
};

type CacheFile = {
  version: 1;
  entries: Record<string, CacheEntry>;
};

const EMPTY_CACHE: CacheFile = { version: 1, entries: {} };

export class JsonCacheStore {
  private static readonly mutations = new Map<string, Promise<unknown>>();

  readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  async get(key: string, now = Date.now()): Promise<CacheEntry | undefined> {
    const cache = await this.read();
    const entry = cache.entries[key];
    if (!entry) {
      return undefined;
    }
    if (entry.expiresAt <= now) {
      await this.mutate((latest) => {
        const latestEntry = latest.entries[key];
        if (latestEntry && latestEntry.expiresAt <= now) {
          delete latest.entries[key];
          return { cache: latest, result: undefined };
        }
        return { result: undefined };
      });
      return undefined;
    }
    return entry;
  }

  async set(entry: CacheEntry): Promise<void> {
    await this.mutate((cache) => {
      cache.entries[entry.key] = entry;
      return { cache, result: undefined };
    });
  }

  async deleteByScopePrefix(scopePrefix: string): Promise<number> {
    return this.mutate((cache) => {
      let count = 0;
      for (const [key, entry] of Object.entries(cache.entries)) {
        if (entry.scope === scopePrefix || entry.scope.startsWith(`${scopePrefix}/`)) {
          delete cache.entries[key];
          count += 1;
        }
      }
      return { cache: count > 0 ? cache : undefined, result: count };
    });
  }

  async clear(options: { scopePrefix?: string } = {}): Promise<number> {
    if (!options.scopePrefix) {
      return this.mutate((cache) => ({
        cache: { ...EMPTY_CACHE, entries: {} },
        result: Object.keys(cache.entries).length,
      }));
    }
    return this.deleteByScopePrefix(options.scopePrefix);
  }

  async prune(now = Date.now()): Promise<number> {
    return this.mutate((cache) => {
      let count = 0;
      for (const [key, entry] of Object.entries(cache.entries)) {
        if (entry.expiresAt <= now) {
          delete cache.entries[key];
          count += 1;
        }
      }
      return { cache: count > 0 ? cache : undefined, result: count };
    });
  }

  async stats(now = Date.now()): Promise<CacheStats> {
    const cache = await this.read();
    const entries = Object.values(cache.entries);
    const expiresAt = entries.map((entry) => entry.expiresAt);
    return {
      path: this.path,
      entryCount: entries.length,
      expiredEntryCount: entries.filter((entry) => entry.expiresAt <= now).length,
      approximateBytes: await this.size(),
      oldestExpiresAt: expiresAt.length === 0 ? null : Math.min(...expiresAt),
      newestExpiresAt: expiresAt.length === 0 ? null : Math.max(...expiresAt),
    };
  }

  private async read(): Promise<CacheFile> {
    if (!existsSync(this.path)) {
      return { ...EMPTY_CACHE, entries: {} };
    }
    try {
      const raw = await readFile(this.path, "utf8");
      const parsed = JSON.parse(raw) as Partial<CacheFile>;
      if (parsed.version !== 1 || typeof parsed.entries !== "object" || !parsed.entries) {
        return { ...EMPTY_CACHE, entries: {} };
      }
      return { version: 1, entries: parsed.entries };
    } catch {
      return { ...EMPTY_CACHE, entries: {} };
    }
  }

  private async mutate<T>(
    operation: (cache: CacheFile) => { cache?: CacheFile; result: T },
  ): Promise<T> {
    const previous = JsonCacheStore.mutations.get(this.path) ?? Promise.resolve();
    const current = previous.catch(() => undefined).then(async () => {
      const cache = await this.read();
      const mutation = operation(cache);
      if (mutation.cache) {
        await this.write(mutation.cache);
      }
      return mutation.result;
    });
    JsonCacheStore.mutations.set(this.path, current);
    try {
      return await current;
    } finally {
      if (JsonCacheStore.mutations.get(this.path) === current) {
        JsonCacheStore.mutations.delete(this.path);
      }
    }
  }

  private async write(cache: CacheFile): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    const tempPath = `${this.path}.${process.pid}.${randomUUID()}.tmp`;
    try {
      await writeFile(tempPath, `${JSON.stringify(cache, null, 2)}\n`);
      if (process.platform === "win32" && existsSync(this.path)) {
        await unlink(this.path);
      }
      await rename(tempPath, this.path);
    } catch (error) {
      if (existsSync(tempPath)) {
        await unlink(tempPath).catch(() => undefined);
      }
      throw error;
    }
  }

  private async size(): Promise<number> {
    if (!existsSync(this.path)) {
      return 0;
    }
    try {
      return (await stat(this.path)).size;
    } catch {
      return 0;
    }
  }
}

export async function removeCacheFile(path: string): Promise<void> {
  if (existsSync(path)) {
    await unlink(path);
  }
}
