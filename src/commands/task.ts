import { Command } from "commander";

import { JetApi, type TaskCreate, type TaskUpdate } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printTask, printTasks } from "../output/human.js";
import { printJson } from "../output/json.js";
import {
  requireProject,
  requireWorkspace,
  resolveTaskTarget,
} from "../resolution/task-target.js";
import { requireApiConfig } from "./shared.js";

type TaskCreateOptions = {
  description?: string;
  status?: string;
  type?: string;
  priority?: string;
  label?: string[];
};

type TaskUpdateOptions = TaskCreateOptions & {
  title?: string;
};

export function createTaskCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("task").description("Work with tasks");

  command
    .command("list")
    .description("List tasks in the current workspace")
    .argument("[query]", "optional title search")
    .option("--status <key>", "filter by status key")
    .option("--assignee <uuid>", "filter by assignee user ID")
    .action(
      async (
        query: string | undefined,
        options: { status?: string; assignee?: string },
      ) => {
        const { config } = await getContext();
        const api = new JetApi(requireApiConfig(config));
        const workspaceSlug = requireWorkspace(config.workspace);
        const tasks = await api.listWorkspaceTasks({
          workspaceSlug,
          projectKey: config.project,
          statusKey: options.status,
          assigneeUserId: options.assignee,
          q: query,
        });
        if (config.output === "json") {
          printJson(tasks);
          return;
        }
        printTasks(tasks);
      },
    );

  command
    .command("get")
    .description("Get a task by ref, number, or title fragment")
    .argument("<target>")
    .action(async (target: string) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const resolved = await resolveTaskTarget({
        api,
        target,
        workspace: config.workspace,
        project: config.project,
      });
      if (config.output === "json") {
        printJson(resolved.task);
        return;
      }
      printTask(resolved.task);
    });

  command
    .command("create")
    .description("Create a task in the current project")
    .argument("<title>")
    .option("--description <text>")
    .option("--status <key>")
    .option("--type <key>")
    .option("--priority <key>")
    .option("--label <key...>")
    .action(async (title: string, options: TaskCreateOptions) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const workspaceSlug = requireWorkspace(config.workspace);
      const projectKey = requireProject(config.project);
      const task = await api.createTask({
        workspaceSlug,
        projectKey,
        body: compactTaskCreate({
          title,
          description: options.description,
          status_key: options.status,
          type_key: options.type,
          priority_key: options.priority,
          label_keys: options.label,
        }),
      });
      if (config.output === "json") {
        printJson(task);
        return;
      }
      printTask(task);
    });

  command
    .command("update")
    .description("Update a task")
    .argument("<target>")
    .option("--title <title>")
    .option("--description <text>")
    .option("--status <key>")
    .option("--type <key>")
    .option("--priority <key>")
    .option("--label <key...>")
    .action(async (target: string, options: TaskUpdateOptions) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const resolved = await resolveTaskTarget({
        api,
        target,
        workspace: config.workspace,
        project: config.project,
      });
      const task = await api.updateTask({
        workspaceSlug: resolved.workspaceSlug,
        projectKey: resolved.projectKey,
        taskNumber: resolved.taskNumber,
        body: compactTaskUpdate({
          title: options.title,
          description: options.description,
          status_key: options.status,
          type_key: options.type,
          priority_key: options.priority,
          label_keys: options.label,
        }),
      });
      if (config.output === "json") {
        printJson(task);
        return;
      }
      printTask(task);
    });

  command
    .command("done")
    .description("Move a task to the done status")
    .argument("<target>")
    .action(async (target: string) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const resolved = await resolveTaskTarget({
        api,
        target,
        workspace: config.workspace,
        project: config.project,
      });
      const task = await api.updateTask({
        workspaceSlug: resolved.workspaceSlug,
        projectKey: resolved.projectKey,
        taskNumber: resolved.taskNumber,
        body: { status_key: "done" },
      });
      if (config.output === "json") {
        printJson(task);
        return;
      }
      printTask(task);
    });

  command
    .command("delete")
    .description("Delete a task")
    .argument("<target>")
    .action(async (target: string) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const resolved = await resolveTaskTarget({
        api,
        target,
        workspace: config.workspace,
        project: config.project,
      });
      await api.deleteTask({
        workspaceSlug: resolved.workspaceSlug,
        projectKey: resolved.projectKey,
        taskNumber: resolved.taskNumber,
      });
      if (config.output === "json") {
        printJson({ deleted: true, ref: resolved.task.display_ref });
        return;
      }
      console.log(`Deleted ${resolved.task.display_ref ?? target}`);
    });

  return command;
}

function compactTaskCreate(body: TaskCreate): TaskCreate {
  return compactObject(body) as TaskCreate;
}

function compactTaskUpdate(body: TaskUpdate): TaskUpdate {
  return compactObject(body) as TaskUpdate;
}

function compactObject(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  );
}
