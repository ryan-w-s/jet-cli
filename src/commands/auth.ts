import { Command } from "commander";

import { JetApi } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printRecords } from "../output/human.js";
import { printJson } from "../output/json.js";
import {
  confirmDestructiveAction,
  printDeleted,
  requireApiConfig,
  type DestructiveOptions,
} from "./shared.js";

export function createAuthCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("auth").description("Check API-key authentication and manage keys");

  command
    .command("status")
    .description("Check whether the configured API key can authenticate")
    .action(async () => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const actor = await api.getCurrentActor();
      if (config.output === "json") {
        printJson(actor);
        return;
      }
      console.log(`Authenticated as ${actor.user.email ?? actor.user.id}`);
      console.log(`Auth type: ${actor.auth_type}`);
    });

  const keys = new Command("keys").description("List, create, and revoke API keys");

  keys
    .command("list")
    .description("List API keys owned by the authenticated user")
    .action(async () => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const apiKeys = await api.listApiKeys();
      if (config.output === "json") {
        printJson(apiKeys);
        return;
      }
      printRecords(apiKeys as unknown as Record<string, unknown>[], "No API keys found.");
    });

  keys
    .command("create")
    .description("Create an API key")
    .argument("<name>", "name shown in API key lists")
    .action(async (name: string) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const apiKey = await api.createApiKey({ name });
      if (config.output === "json") {
        printJson(apiKey);
        return;
      }
      console.log(`Created API key ${apiKey.id}`);
      console.log(apiKey.secret);
      console.error("Store this secret now. It will not be shown again.");
    });

  keys
    .command("revoke")
    .description("Revoke an API key")
    .argument("<api-key-id>", "API key ID to revoke")
    .option("--force", "revoke without prompting")
    .action(async (apiKeyId: string, options: DestructiveOptions) => {
      const context = await getContext();
      const { config } = context;
      const api = new JetApi(requireApiConfig(config));
      await confirmDestructiveAction(context, options, `Revoke API key ${apiKeyId}?`);
      await api.revokeApiKey(apiKeyId);
      printDeleted(config, "api-key", apiKeyId);
    });

  command.addCommand(keys);

  return command;
}
