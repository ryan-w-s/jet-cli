import { Command } from "commander";

import { JetApi } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printWorkspaces } from "../output/human.js";
import { printJson } from "../output/json.js";
import { requireApiConfig } from "./shared.js";

export function createWorkspaceCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("workspace").description("Work with workspaces");

  command
    .command("list")
    .description("List workspaces visible to the API key")
    .action(async () => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const workspaces = await api.listWorkspaces();
      if (config.output === "json") {
        printJson(workspaces);
        return;
      }
      printWorkspaces(workspaces);
    });

  return command;
}
