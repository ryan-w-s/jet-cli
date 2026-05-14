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
  const command = new Command("link").description("Manage relationships between tasks");

  command
    .command("list")
    .description("List links for a task")
    .argument("<task>", "task ref, number, or title fragment")
    .action(async (task: string) => {
      const { api, config, resolved } = await resolve(getContext, task);
      printList(config.output, await api.listTaskLinks(resolved));
    });

  command
    .command("create")
    .description("Link one task to another")
    .argument("<task>", "source task ref, number, or title fragment")
    .argument("<target-task>", "target task ref, number, or title fragment")
    .option("--type <relationship>", "relationship type, such as relates_to or blocks", "relates_to")
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
    .description("Update a task link relationship type")
    .argument("<task>", "task ref, number, or title fragment")
    .argument("<link-id>", "task link ID")
    .option("--type <relationship>", "new relationship type")
    .action(async (task: string, linkId: string, options: { type?: string }) => {
      const { api, config, resolved } = await resolve(getContext, task);
      if (!options.type) {
        throw new CliUsageError("Relationship type is required. Pass --type <relationship>.");
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
    .description("Delete a task link")
    .argument("<task>", "task ref, number, or title fragment")
    .argument("<link-id>", "task link ID")
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
  const command = new Command("reference").description("Manage external references attached to tasks");

  command
    .command("list")
    .description("List external references for a task")
    .argument("<task>", "task ref, number, or title fragment")
    .action(async (task: string) => {
      const { api, config, resolved } = await resolve(getContext, task);
      printList(config.output, await api.listTaskReferences(resolved));
    });

  command
    .command("create")
    .description("Attach an external URL to a task")
    .argument("<task>", "task ref, number, or title fragment")
    .argument("<url>", "external URL")
    .option("--title <title>", "reference title")
    .action(async (task: string, url: string, options: { title?: string }) => {
      const { api, config, resolved } = await resolve(getContext, task);
      printOne(
        config.output,
        await api.createTaskReference({ ...resolved, url, title: options.title }),
      );
    });

  command
    .command("update")
    .description("Update a task reference")
    .argument("<task>", "task ref, number, or title fragment")
    .argument("<reference-id>", "reference ID")
    .argument("<url>", "new external URL")
    .option("--title <title>", "new reference title")
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
    .description("Delete a task reference")
    .argument("<task>", "task ref, number, or title fragment")
    .argument("<reference-id>", "reference ID")
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
  const command = new Command("board").description("Manage saved task-filter boards");

  command.command("list").description("List boards in the active project").action(async () => {
    const { api, config, workspaceSlug, projectKey } = await projectContext(getContext);
    printList(config.output, await api.listBoards({ workspaceSlug, projectKey }));
  });

  command
    .command("get")
    .description("Show a board")
    .argument("<key>", "board key")
    .action(async (boardKey: string) => {
      const { api, config, workspaceSlug, projectKey } = await projectContext(getContext);
      printOne(config.output, await api.getBoard({ workspaceSlug, projectKey, boardKey }));
    });

  command
    .command("create")
    .description("Create a board from task filters")
    .argument("<key>", "board key")
    .argument("<name>", "board name")
    .option("--description <text>", "board description")
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
    .description("Update a board")
    .argument("<key>", "board key")
    .option("--name <name>", "new board name")
    .option("--description <text>", "new board description")
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
    .description("Delete a board")
    .argument("<key>", "board key")
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
