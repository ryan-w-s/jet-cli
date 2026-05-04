import { Command } from "commander";

import { JetApi } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printJson } from "../output/json.js";
import { requireApiConfig } from "./shared.js";

export function createAuthCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("auth").description("Inspect API-key authentication");

  command
    .command("status")
    .description("Check whether the configured API key works")
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

  return command;
}
