import type { JetApiOptions } from "../api/client.js";
import type { JetConfig } from "../config/load.js";
import { CliUsageError } from "../resolution/task-target.js";

export function requireApiConfig(config: JetConfig): JetApiOptions {
  if (!config.apiUrl) {
    throw new CliUsageError(
      "API URL is required. Pass --api-url, set JET_API_URL, or run `jet config set api-url <url>`.",
    );
  }
  if (!config.apiKey) {
    throw new CliUsageError(
      "API key is required. Pass --api-key, set JET_API_KEY, or run `jet config set api-key <key>`.",
    );
  }
  return { apiUrl: config.apiUrl, apiKey: config.apiKey };
}
