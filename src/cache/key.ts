export const CACHE_SCHEMA_VERSION = "v1";

export type CacheKeyOptions = {
  apiUrl: string;
  apiKeyFingerprint: string;
  method: "GET";
  path: string;
  pathParams?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
};

export function buildCacheKey(options: CacheKeyOptions): string {
  return [
    CACHE_SCHEMA_VERSION,
    options.method,
    trimTrailingSlash(options.apiUrl),
    options.apiKeyFingerprint,
    options.path,
    stableStringify(options.pathParams ?? {}),
    stableStringify(options.queryParams ?? {}),
  ].join(":");
}

export function rootScope(apiUrl: string, apiKeyFingerprint: string): string {
  return buildScope([CACHE_SCHEMA_VERSION, trimTrailingSlash(apiUrl), apiKeyFingerprint]);
}

export function buildScope(parts: string[]): string {
  return parts.map((part) => encodeURIComponent(part)).join("/");
}

export function childScope(parent: string, ...parts: string[]): string {
  return [parent, ...parts.map((part) => encodeURIComponent(part))].join("/");
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (typeof value !== "object" || value === null) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortValue(entry)]),
  );
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
