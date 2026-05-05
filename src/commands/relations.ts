import { Command } from "commander";

import { JetApi, type TaskRef } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printRecordList, printRecordValue } from "../output/human.js";
import {
  CliUsageError,
  requireProject,
  requireWorkspace,
  resolveTaskTarget,
  type TaskCoordinates,
} from "../resolution/task-target.js";
import {
  compactObject,
  confirmDestructiveAction,
  parseJsonObject,
  printDeleted,
  requireApiConfig,
  type DestructiveOptions,
} from "./shared.js";

export function createLinkCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("link").description("Manage task links");

  command.command("list").argument("<task>").action(async (task: string) => {
    const { api, config, resolved } = await resolve(getContext, task);
    printList(config.output, await api.listTaskLinks(resolved));
  });

  command
    .command("create")
    .argument("<task>")
    .argument("<target-task>")
    .option("--type <relationship>", "relationship type", "relates_to")
    .action(
      async (
        task: string,
        targetTask: string,
        options: { type: string },
      ) => {
        const { api, config, resolved } = await resolve(getContext, task);
        const target = await resolveTaskTarget({
          api,
          target: targetTask,
          workspace: config.workspace,
          project: config.project,
        });
        printOne(
          config.output,
          await api.createTaskLink({
            ...resolved,
            targetTask: toTaskRef(target),
            relationshipType: options.type,
          }),
        );
      },
    );

  command
    .command("update")
    .argument("<task>")
    .argument("<link-id>")
    .option("--type <relationship>", "relationship type")
    .action(async (task: string, linkId: string, options: { type?: string }) => {
      const { api, config, resolved } = await resolve(getContext, task);
      if (!options.type) {
        throw new CliUsageError("Pass --type <relationship>.");
      }
      printOne(
        config.output,
        await api.updateTaskLink({
          ...resolved,
          linkId,
          relationshipType: options.type,
        }),
      );
    });

  command
    .command("delete")
    .argument("<task>")
    .argument("<link-id>")
    .option("--force", "delete without prompting")
    .action(async (task: string, linkId: string, options: DestructiveOptions) => {
      const context = await getContext();
      const { api, config, resolved } = await resolveFromContext(context, task);
      await confirmDestructiveAction(context, options, `Delete task link ${linkId}?`);
      await api.deleteTaskLink({ ...resolved, linkId });
      printDeleted(config, "task-link", linkId);
    });

  return command;
}

export function createReferenceCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("reference").description("Manage task references");

  command.command("list").argument("<task>").action(async (task: string) => {
    const { api, config, resolved } = await resolve(getContext, task);
    printList(config.output, await api.listTaskReferences(resolved));
  });

  command
    .command("create")
    .argument("<task>")
    .argument("<url>")
    .option("--title <title>")
    .action(async (task: string, url: string, options: { title?: string }) => {
      const { api, config, resolved } = await resolve(getContext, task);
      printOne(
        config.output,
        await api.createTaskReference({ ...resolved, url, title: options.title }),
      );
    });

  command
    .command("update")
    .argument("<task>")
    .argument("<reference-id>")
    .argument("<url>")
    .option("--title <title>")
    .action(
      async (
        task: string,
        referenceId: string,
        url: string,
        options: { title?: string },
      ) => {
        const { api, config, resolved } = await resolve(getContext, task);
        printOne(
          config.output,
          await api.updateTaskReference({
            ...resolved,
            referenceId,
            url,
            title: options.title,
          }),
        );
      },
    );

  command
    .command("delete")
    .argument("<task>")
    .argument("<reference-id>")
    .option("--force", "delete without prompting")
    .action(
      async (
        task: string,
        referenceId: string,
        options: DestructiveOptions,
      ) => {
        const context = await getContext();
        const { api, config, resolved } = await resolveFromContext(context, task);
        await confirmDestructiveAction(
          context,
          options,
          `Delete task reference ${referenceId}?`,
        );
        await api.deleteTaskReference({ ...resolved, referenceId });
        printDeleted(config, "task-reference", referenceId);
      },
    );

  return command;
}

export function createBoardCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("board").description("Manage project boards");

  command.command("list").action(async () => {
    const { api, config, workspaceSlug, projectKey } = await projectContext(getContext);
    printList(config.output, await api.listBoards({ workspaceSlug, projectKey }));
  });

  command.command("get").argument("<key>").action(async (boardKey: string) => {
    const { api, config, workspaceSlug, projectKey } = await projectContext(getContext);
    printOne(config.output, await api.getBoard({ workspaceSlug, projectKey, boardKey }));
  });

  command
    .command("create")
    .argument("<key>")
    .argument("<name>")
    .option("--description <text>")
    .option("--filters <json>", "JSON object of task filters")
    .action(
      async (
        key: string,
        name: string,
        options: { description?: string; filters?: string },
      ) => {
        const { api, config, workspaceSlug, projectKey } = await projectContext(
          getContext,
        );
        printOne(
          config.output,
          await api.createBoard({
            workspaceSlug,
            projectKey,
            body: {
              key,
              name,
              description: options.description,
              filters: parseJsonObject(options.filters),
            },
          }),
        );
      },
    );

  command
    .command("update")
    .argument("<key>")
    .option("--name <name>")
    .option("--description <text>")
    .option("--filters <json>", "JSON object of task filters")
    .action(
      async (
        boardKey: string,
        options: { name?: string; description?: string; filters?: string },
      ) => {
        const { api, config, workspaceSlug, projectKey } = await projectContext(
          getContext,
        );
        printOne(
          config.output,
          await api.updateBoard({
            workspaceSlug,
            projectKey,
            boardKey,
            body: compactObject({
              name: options.name,
              description: options.description,
              filters:
                options.filters === undefined
                  ? undefined
                  : parseJsonObject(options.filters),
            }),
          }),
        );
      },
    );

  command
    .command("delete")
    .argument("<key>")
    .option("--force", "delete without prompting")
    .action(async (boardKey: string, options: DestructiveOptions) => {
      const context = await getContext();
      const { api, config, workspaceSlug, projectKey } = await projectContextFromContext(
        context,
      );
      await confirmDestructiveAction(context, options, `Delete board ${boardKey}?`);
      await api.deleteBoard({ workspaceSlug, projectKey, boardKey });
      printDeleted(config, "board", boardKey);
    });

  return command;
}

async function resolve(
  getContext: () => Promise<RuntimeContext>,
  task: string,
): Promise<ResolvedTaskContext> {
  return resolveFromContext(await getContext(), task);
}

async function resolveFromContext(
  context: RuntimeContext,
  task: string,
): Promise<ResolvedTaskContext> {
  const api = new JetApi(requireApiConfig(context.config));
  const resolved = await resolveTaskTarget({
    api,
    target: task,
    workspace: context.config.workspace,
    project: context.config.project,
  });
  return { api, config: context.config, resolved };
}

type ResolvedTaskContext = {
  api: JetApi;
  config: RuntimeContext["config"];
  resolved: TaskCoordinates & { task: unknown };
};

async function projectContext(
  getContext: () => Promise<RuntimeContext>,
): Promise<Awaited<ReturnType<typeof projectContextFromContext>>> {
  return projectContextFromContext(await getContext());
}

async function projectContextFromContext(context: RuntimeContext): Promise<{
  api: JetApi;
  config: RuntimeContext["config"];
  workspaceSlug: string;
  projectKey: string;
}> {
  return {
    api: new JetApi(requireApiConfig(context.config)),
    config: context.config,
    workspaceSlug: requireWorkspace(context.config.workspace),
    projectKey: requireProject(context.config.project),
  };
}

function toTaskRef(value: { projectKey: string; taskNumber: number }): TaskRef {
  return { project_key: value.projectKey, task_number: value.taskNumber };
}

function printList(output: string | undefined, records: unknown[]): void {
  printRecordList(output, records, "No records found.");
}

function printOne(output: string | undefined, record: unknown): void {
  printRecordValue(output, record, "No record found.");
}
