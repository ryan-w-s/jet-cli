import { Command } from "commander";

import { JetApi } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printRecordList, printRecordValue } from "../output/human.js";
import { requireProject, requireWorkspace } from "../resolution/task-target.js";
import {
  compactObject,
  confirmDestructiveAction,
  printDeleted,
  requireApiConfig,
  type DestructiveOptions,
} from "./shared.js";

type NamedOptions = {
  name?: string;
  description?: string;
};

type RankedOptions = {
  name?: string;
  rank?: string;
};

type StatusOptions = RankedOptions & {
  category?: string;
};

type LabelOptions = {
  name?: string;
  color?: string;
};

export function createTypeCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("type").description("Manage workspace task types");

  command.command("list").description("List task types in the active workspace").action(async () => {
    const { config } = await getContext();
    const api = new JetApi(requireApiConfig(config));
    printList(config.output, await api.listTaskTypes(requireWorkspace(config.workspace)));
  });

  command
    .command("get")
    .description("Show a task type")
    .argument("<key>", "task type key")
    .action(async (typeKey: string) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      printOne(
        config.output,
        await api.getTaskType({
          workspaceSlug: requireWorkspace(config.workspace),
          typeKey,
        }),
      );
    });

  command
    .command("create")
    .description("Create a task type")
    .argument("<key>", "task type key")
    .argument("<name>", "task type name")
    .option("--description <text>", "task type description")
    .action(async (key: string, name: string, options: NamedOptions) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      printOne(
        config.output,
        await api.createTaskType({
          workspaceSlug: requireWorkspace(config.workspace),
          body: { key, name, description: options.description },
        }),
      );
    });

  command
    .command("update")
    .description("Update a task type")
    .argument("<key>", "task type key")
    .option("--name <name>", "new task type name")
    .option("--description <text>", "new task type description")
    .action(async (typeKey: string, options: NamedOptions) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      printOne(
        config.output,
        await api.updateTaskType({
          workspaceSlug: requireWorkspace(config.workspace),
          typeKey,
          body: compactObject({
            name: options.name,
            description: options.description,
          }),
        }),
      );
    });

  command
    .command("delete")
    .description("Delete a task type")
    .argument("<key>", "task type key")
    .option("--force", "delete without prompting")
    .action(async (typeKey: string, options: DestructiveOptions) => {
      const context = await getContext();
      const { config } = context;
      const api = new JetApi(requireApiConfig(config));
      await confirmDestructiveAction(context, options, `Delete task type ${typeKey}?`);
      await api.deleteTaskType({
        workspaceSlug: requireWorkspace(config.workspace),
        typeKey,
      });
      printDeleted(config, "task-type", typeKey);
    });

  return command;
}

export function createPriorityCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("priority").description("Manage workspace task priorities");

  command.command("list").description("List task priorities in the active workspace").action(async () => {
    const { config } = await getContext();
    const api = new JetApi(requireApiConfig(config));
    printList(config.output, await api.listTaskPriorities(requireWorkspace(config.workspace)));
  });

  command
    .command("get")
    .description("Show a task priority")
    .argument("<key>", "priority key")
    .action(async (priorityKey: string) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      printOne(
        config.output,
        await api.getTaskPriority({
          workspaceSlug: requireWorkspace(config.workspace),
          priorityKey,
        }),
      );
    });

  command
    .command("create")
    .description("Create a task priority")
    .argument("<key>", "priority key")
    .argument("<name>", "priority name")
    .option("--rank <number>", "sort rank", "0")
    .action(async (key: string, name: string, options: { rank: string }) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      printOne(
        config.output,
        await api.createTaskPriority({
          workspaceSlug: requireWorkspace(config.workspace),
          body: { key, name, rank: Number(options.rank) },
        }),
      );
    });

  command
    .command("update")
    .description("Update a task priority")
    .argument("<key>", "priority key")
    .option("--name <name>", "new priority name")
    .option("--rank <number>", "new sort rank")
    .action(async (priorityKey: string, options: RankedOptions) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      printOne(
        config.output,
        await api.updateTaskPriority({
          workspaceSlug: requireWorkspace(config.workspace),
          priorityKey,
          body: compactObject({
            name: options.name,
            rank: options.rank === undefined ? undefined : Number(options.rank),
          }),
        }),
      );
    });

  command
    .command("delete")
    .description("Delete a task priority")
    .argument("<key>", "priority key")
    .option("--force", "delete without prompting")
    .action(async (priorityKey: string, options: DestructiveOptions) => {
      const context = await getContext();
      const { config } = context;
      const api = new JetApi(requireApiConfig(config));
      await confirmDestructiveAction(
        context,
        options,
        `Delete task priority ${priorityKey}?`,
      );
      await api.deleteTaskPriority({
        workspaceSlug: requireWorkspace(config.workspace),
        priorityKey,
      });
      printDeleted(config, "task-priority", priorityKey);
    });

  return command;
}

export function createStatusCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("status").description("Manage project task statuses");

  command.command("list").description("List statuses in the active project").action(async () => {
    const { config } = await getContext();
    const api = new JetApi(requireApiConfig(config));
    printList(
      config.output,
      await api.listProjectStatuses({
        workspaceSlug: requireWorkspace(config.workspace),
        projectKey: requireProject(config.project),
      }),
    );
  });

  command
    .command("get")
    .description("Show a task status")
    .argument("<key>", "status key")
    .action(async (statusKey: string) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      printOne(
        config.output,
        await api.getTaskStatus({
          workspaceSlug: requireWorkspace(config.workspace),
          projectKey: requireProject(config.project),
          statusKey,
        }),
      );
    });

  command
    .command("create")
    .description("Create a task status in the active project")
    .argument("<key>", "status key")
    .argument("<name>", "status name")
    .option("--category <category>", "status category, such as open or done")
    .option("--rank <number>", "sort rank", "0")
    .action(async (key: string, name: string, options: Required<StatusOptions>) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      printOne(
        config.output,
        await api.createTaskStatus({
          workspaceSlug: requireWorkspace(config.workspace),
          projectKey: requireProject(config.project),
          body: {
            key,
            name,
            category: options.category,
            rank: Number(options.rank),
          },
        }),
      );
    });

  command
    .command("update")
    .description("Update a task status")
    .argument("<key>", "status key")
    .option("--name <name>", "new status name")
    .option("--category <category>", "new status category")
    .option("--rank <number>", "new sort rank")
    .action(async (statusKey: string, options: StatusOptions) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      printOne(
        config.output,
        await api.updateTaskStatus({
          workspaceSlug: requireWorkspace(config.workspace),
          projectKey: requireProject(config.project),
          statusKey,
          body: compactObject({
            name: options.name,
            category: options.category,
            rank: options.rank === undefined ? undefined : Number(options.rank),
          }),
        }),
      );
    });

  command
    .command("delete")
    .description("Delete a task status")
    .argument("<key>", "status key")
    .option("--force", "delete without prompting")
    .action(async (statusKey: string, options: DestructiveOptions) => {
      const context = await getContext();
      const { config } = context;
      const api = new JetApi(requireApiConfig(config));
      await confirmDestructiveAction(context, options, `Delete task status ${statusKey}?`);
      await api.deleteTaskStatus({
        workspaceSlug: requireWorkspace(config.workspace),
        projectKey: requireProject(config.project),
        statusKey,
      });
      printDeleted(config, "task-status", statusKey);
    });

  return command;
}

export function createLabelCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("label").description("Manage project labels");

  command.command("list").description("List labels in the active project").action(async () => {
    const { config } = await getContext();
    const api = new JetApi(requireApiConfig(config));
    printList(
      config.output,
      await api.listProjectLabels({
        workspaceSlug: requireWorkspace(config.workspace),
        projectKey: requireProject(config.project),
      }),
    );
  });

  command
    .command("get")
    .description("Show a label")
    .argument("<key>", "label key")
    .action(async (labelKey: string) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      printOne(
        config.output,
        await api.getLabel({
          workspaceSlug: requireWorkspace(config.workspace),
          projectKey: requireProject(config.project),
          labelKey,
        }),
      );
    });

  command
    .command("create")
    .description("Create a project label")
    .argument("<key>", "label key")
    .argument("<name>", "label name")
    .option("--color <color>", "label color name or value")
    .action(async (key: string, name: string, options: LabelOptions) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      printOne(
        config.output,
        await api.createLabel({
          workspaceSlug: requireWorkspace(config.workspace),
          projectKey: requireProject(config.project),
          body: { key, name, color: options.color },
        }),
      );
    });

  command
    .command("update")
    .description("Update a project label")
    .argument("<key>", "label key")
    .option("--name <name>", "new label name")
    .option("--color <color>", "new label color")
    .action(async (labelKey: string, options: LabelOptions) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      printOne(
        config.output,
        await api.updateLabel({
          workspaceSlug: requireWorkspace(config.workspace),
          projectKey: requireProject(config.project),
          labelKey,
          body: compactObject({
            name: options.name,
            color: options.color,
          }),
        }),
      );
    });

  command
    .command("delete")
    .description("Delete a project label")
    .argument("<key>", "label key")
    .option("--force", "delete without prompting")
    .action(async (labelKey: string, options: DestructiveOptions) => {
      const context = await getContext();
      const { config } = context;
      const api = new JetApi(requireApiConfig(config));
      await confirmDestructiveAction(context, options, `Delete label ${labelKey}?`);
      await api.deleteLabel({
        workspaceSlug: requireWorkspace(config.workspace),
        projectKey: requireProject(config.project),
        labelKey,
      });
      printDeleted(config, "label", labelKey);
    });

  return command;
}

function printList(output: string | undefined, records: unknown[]): void {
  printRecordList(output, records, "No records found.");
}

function printOne(output: string | undefined, record: unknown): void {
  printRecordValue(output, record, "No record found.");
}
