import type { JetApiOptions } from "../api/client.js";
import { DEFAULT_API_URL, type JetConfig, type RuntimeContext } from "../config/load.js";
import { CliUsageError } from "../resolution/task-target.js";

export function requireApiConfig(config: JetConfig): JetApiOptions {
  if (!config.apiKey) {
    throw new CliUsageError(
      "API key is required. Pass --api-key <key>, set JET_API_KEY, or run `jet config set api-key <key>`.",
      {
        code: "missing_api_key",
        recovery:
          "Create an API key in the web app, then pass --api-key <key>, set JET_API_KEY, or run `jet config set api-key <key>`.",
      },
    );
  }
  return {
    apiUrl: config.apiUrl ?? DEFAULT_API_URL,
    apiKey: config.apiKey,
    cache: config.cache,
    cacheRefresh: config.cacheRefresh,
  };
}

export type DestructiveOptions = {
  force?: boolean;
};

export async function confirmDestructiveAction(
  context: RuntimeContext,
  options: DestructiveOptions,
  message: string,
): Promise<void> {
  if (options.force) {
    return;
  }
  if (context.noInput) {
    throw new CliUsageError(`${message} Confirmation is disabled by --no-input. Re-run with --force to confirm.`);
  }

  const { createInterface } = await import("node:readline/promises");
  const readline = createInterface({
    input: process.stdin,
    output: process.stderr,
  });
  try {
    const answer = await readline.question(`${message} Type "yes" to continue: `);
    if (answer.trim().toLowerCase() !== "yes") {
      throw new CliUsageError("Operation cancelled.");
    }
  } finally {
    readline.close();
  }
}

export function compactObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

export function parseJsonObject(value: string | undefined): Record<string, unknown> {
  if (!value) {
    return {};
  }
  const parsed = JSON.parse(value) as unknown;
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new CliUsageError(`Expected a JSON object, for example '{"statusKey":"open"}'. Received: ${value}`);
  }
  return parsed as Record<string, unknown>;
}

export function printDeleted(config: JetConfig, resource: string, id: string): void {
  if (config.output === "json") {
    console.log(JSON.stringify({ deleted: true, resource, id }, null, 2));
    return;
  }
  console.log(`Deleted ${resource} ${id}`);
}
