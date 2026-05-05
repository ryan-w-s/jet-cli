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

  command.command("list").action(async () => {
    const { config } = await getContext();
    const api = new JetApi(requireApiConfig(config));
    printList(config.output, await api.listTaskTypes(requireWorkspace(config.workspace)));
  });

  command.command("get").argument("<key>").action(async (typeKey: string) => {
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
    .argument("<key>")
    .argument("<name>")
    .option("--description <text>")
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
    .argument("<key>")
    .option("--name <name>")
    .option("--description <text>")
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
    .argument("<key>")
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
  const command = new Command("priority").description("Manage task priorities");

  command.command("list").action(async () => {
    const { config } = await getContext();
    const api = new JetApi(requireApiConfig(config));
    printList(config.output, await api.listTaskPriorities(requireWorkspace(config.workspace)));
  });

  command.command("get").argument("<key>").action(async (priorityKey: string) => {
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
    .argument("<key>")
    .argument("<name>")
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
    .argument("<key>")
    .option("--name <name>")
    .option("--rank <number>")
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
    .argument("<key>")
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

  command.command("list").action(async () => {
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

  command.command("get").argument("<key>").action(async (statusKey: string) => {
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
    .argument("<key>")
    .argument("<name>")
    .option("--category <category>")
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
    .argument("<key>")
    .option("--name <name>")
    .option("--category <category>")
    .option("--rank <number>")
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
    .argument("<key>")
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

  command.command("list").action(async () => {
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

  command.command("get").argument("<key>").action(async (labelKey: string) => {
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
    .argument("<key>")
    .argument("<name>")
    .option("--color <color>")
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
    .argument("<key>")
    .option("--name <name>")
    .option("--color <color>")
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
    .argument("<key>")
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
