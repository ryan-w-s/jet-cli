import { Command } from "commander";

import { fingerprintApiKey } from "../cache/fingerprint.js";
import { rootScope } from "../cache/key.js";
import { defaultCacheFile } from "../cache/paths.js";
import { JsonCacheStore } from "../cache/store.js";
import type { RuntimeContext } from "../config/load.js";
import { printJson } from "../output/json.js";
import { requireApiConfig } from "./shared.js";

type ClearOptions = {
  all?: boolean;
};

export function createCacheCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("cache").description("Manage the local JET CLI cache");

  command
    .command("status")
    .description("Show local cache status")
    .action(async () => {
      const { config } = await getContext();
      const store = new JsonCacheStore(defaultCacheFile());
      const stats = await store.stats();
      const status = {
        enabled: config.cache !== "off",
        path: stats.path,
        entryCount: stats.entryCount,
        expiredEntryCount: stats.expiredEntryCount,
        approximateBytes: stats.approximateBytes,
        oldestExpiresAt: stats.oldestExpiresAt === null ? null : new Date(stats.oldestExpiresAt).toISOString(),
        newestExpiresAt: stats.newestExpiresAt === null ? null : new Date(stats.newestExpiresAt).toISOString(),
      };
      if (config.output === "json") {
        printJson(status);
        return;
      }
      console.log(`Cache: ${status.enabled ? "on" : "off"}`);
      console.log(`Path: ${status.path}`);
      console.log(`Entries: ${status.entryCount}`);
      console.log(`Expired entries: ${status.expiredEntryCount}`);
      console.log(`Approximate size: ${status.approximateBytes} bytes`);
      console.log(`Oldest expiration: ${status.oldestExpiresAt ?? "n/a"}`);
      console.log(`Newest expiration: ${status.newestExpiresAt ?? "n/a"}`);
    });

  command
    .command("clear")
    .description("Clear cached API responses for the current API key scope")
    .option("--all", "clear every cache entry for every API URL and API key")
    .action(async (options: ClearOptions) => {
      const { config } = await getContext();
      const store = new JsonCacheStore(defaultCacheFile());
      const deleted = options.all
        ? await store.clear()
        : await store.clear({ scopePrefix: currentScope(config) });
      if (config.output === "json") {
        printJson({ cleared: true, deleted, all: Boolean(options.all), path: store.path });
        return;
      }
      console.log(`Cleared ${deleted} cache ${deleted === 1 ? "entry" : "entries"}.`);
    });

  command
    .command("prune")
    .description("Remove expired cache entries")
    .action(async () => {
      const { config } = await getContext();
      const store = new JsonCacheStore(defaultCacheFile());
      const deleted = await store.prune();
      if (config.output === "json") {
        printJson({ pruned: true, deleted, path: store.path });
        return;
      }
      console.log(`Pruned ${deleted} expired cache ${deleted === 1 ? "entry" : "entries"}.`);
    });

  return command;
}

function currentScope(config: RuntimeContext["config"]): string {
  const apiConfig = requireApiConfig(config);
  return rootScope(apiConfig.apiUrl, fingerprintApiKey(apiConfig.apiKey));
}
