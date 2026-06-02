import { Command } from "commander";

import { JetApi } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printProjects, printRecordValue } from "../output/human.js";
import { printJson } from "../output/json.js";
import { requireProject, requireWorkspace } from "../resolution/task-target.js";
import {
  assertAdminCommandsEnabled,
  compactObject,
  confirmDestructiveAction,
  printDeleted,
  requireApiConfig,
  type DestructiveOptions,
} from "./shared.js";

export function createProjectCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("project").description("List, create, update, and delete projects");

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

  command
    .command("get")
    .description("Show a project")
    .argument("[project]", "project key")
    .argument("[workspace]", "workspace slug")
    .action(async (project: string | undefined, workspace: string | undefined) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const record = await api.getProject({
        workspaceSlug: requireWorkspace(workspace ?? config.workspace),
        projectKey: requireProject(project ?? config.project),
      });
      printValue(config.output, record, "No project found.");
    });

  command
    .command("create")
    .description("Create a project")
    .argument("<key>", "project key used in task refs, for example JET")
    .argument("<name>", "project name")
    .argument("[workspace]", "workspace slug")
    .option("--description <text>", "project description")
    .action(
      async (
        key: string,
        name: string,
        workspace: string | undefined,
        options: { description?: string },
      ) => {
        const context = await getContext();
        assertAdminCommandsEnabled(context);
        const { config } = context;
        const api = new JetApi(requireApiConfig(config));
        const record = await api.createProject({
          workspaceSlug: requireWorkspace(workspace ?? config.workspace),
          body: { key, name, description: options.description },
        });
        printValue(config.output, record, "No project found.");
      },
    );

  command
    .command("update")
    .description("Update a project")
    .argument("[project]", "project key")
    .argument("[workspace]", "workspace slug")
    .option("--name <name>", "new project name")
    .option("--description <text>", "new project description")
    .action(
      async (
        project: string | undefined,
        workspace: string | undefined,
        options: { name?: string; description?: string },
      ) => {
        const context = await getContext();
        assertAdminCommandsEnabled(context);
        const { config } = context;
        const api = new JetApi(requireApiConfig(config));
        const record = await api.updateProject({
          workspaceSlug: requireWorkspace(workspace ?? config.workspace),
          projectKey: requireProject(project ?? config.project),
          body: compactObject({
            name: options.name,
            description: options.description,
          }),
        });
        printValue(config.output, record, "No project found.");
      },
    );

  command
    .command("delete")
    .description("Delete a project")
    .argument("[project]", "project key")
    .argument("[workspace]", "workspace slug")
    .option("--force", "delete without prompting")
    .action(
      async (
        project: string | undefined,
        workspace: string | undefined,
        options: DestructiveOptions,
      ) => {
        const context = await getContext();
        assertAdminCommandsEnabled(context);
        const { config } = context;
        const api = new JetApi(requireApiConfig(config));
        const workspaceSlug = requireWorkspace(workspace ?? config.workspace);
        const projectKey = requireProject(project ?? config.project);
        await confirmDestructiveAction(
          context,
          options,
          `Delete project ${projectKey} in workspace ${workspaceSlug}?`,
        );
        await api.deleteProject({ workspaceSlug, projectKey });
        printDeleted(config, "project", projectKey);
      },
    );

  return command;
}

function printValue(output: string | undefined, record: unknown, emptyMessage: string): void {
  printRecordValue(output, record, emptyMessage);
}
