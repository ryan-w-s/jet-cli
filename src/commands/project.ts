import { Command } from "commander";

import { JetApi } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printProjects } from "../output/human.js";
import { printJson } from "../output/json.js";
import { requireWorkspace } from "../resolution/task-target.js";
import { requireApiConfig } from "./shared.js";

export function createProjectCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("project").description("Work with projects");

  command
    .command("list")
    .description("List projects in a workspace")
    .argument("[workspace]", "workspace slug")
    .action(async (workspace: string | undefined) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const workspaceSlug = requireWorkspace(workspace ?? config.workspace);
      const projects = await api.listProjects(workspaceSlug);
      if (config.output === "json") {
        printJson(projects);
        return;
      }
      printProjects(projects);
    });

  return command;
}
