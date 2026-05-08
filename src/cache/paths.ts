import { join } from "node:path";

export function defaultCacheFile(): string {
  return join(cacheHome(), "jet", "cache.json");
}

function cacheHome(): string {
  if (process.platform === "win32") {
    return (
      process.env["LOCALAPPDATA"] ??
      process.env["APPDATA"] ??
      join(process.env["USERPROFILE"] ?? "", "AppData", "Local")
    );
  }
  return process.env["XDG_CACHE_HOME"] ?? join(process.env["HOME"] ?? "", ".cache");
}
