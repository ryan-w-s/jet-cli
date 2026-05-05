import { Command } from "commander";

import { JetApi, type TaskCreate, type TaskRef, type TaskUpdate } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printTask, printTasks } from "../output/human.js";
import { printJson } from "../output/json.js";
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
  requireApiConfig,
  type DestructiveOptions,
} from "./shared.js";

type TaskCreateOptions = {
  description?: string;
  status?: string;
  type?: string;
  priority?: string;
  label?: string[];
  assignee?: string;
  parent?: string;
};

type TaskUpdateOptions = TaskCreateOptions & {
  title?: string;
};

type TaskDoneOptions = {
  status?: string;
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
    .option("--assignee <uuid>")
    .option("--parent <target>")
    .action(async (title: string, options: TaskCreateOptions) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const workspaceSlug = requireWorkspace(config.workspace);
      const projectKey = requireProject(config.project);
      const parentTask = options.parent
        ? await resolveTaskRef(api, options.parent, config.workspace, config.project)
        : undefined;
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
          assignee_user_id: options.assignee,
          parent_task: parentTask,
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
    .option("--assignee <uuid>")
    .option("--parent <target>")
    .action(async (target: string, options: TaskUpdateOptions) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const resolved = await resolveTaskTarget({
        api,
        target,
        workspace: config.workspace,
        project: config.project,
      });
      const parentTask = options.parent
        ? await resolveParentTaskRef(api, options.parent, resolved)
        : undefined;
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
          assignee_user_id: options.assignee,
          parent_task: parentTask,
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
    .description("Move a task to the project's done status")
    .argument("<target>")
    .option("--status <key>", "explicit done status key")
    .action(async (target: string, options: TaskDoneOptions) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const resolved = await resolveTaskTarget({
        api,
        target,
        workspace: config.workspace,
        project: config.project,
      });
      const statusKey =
        options.status ??
        (await resolveDoneStatus(api, resolved.workspaceSlug, resolved.projectKey));
      const task = await api.updateTask({
        workspaceSlug: resolved.workspaceSlug,
        projectKey: resolved.projectKey,
        taskNumber: resolved.taskNumber,
        body: { status_key: statusKey },
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
    .option("--force", "delete without prompting")
    .action(async (target: string, options: DestructiveOptions) => {
      const context = await getContext();
      const { config } = context;
      const api = new JetApi(requireApiConfig(config));
      const resolved = await resolveTaskTarget({
        api,
        target,
        workspace: config.workspace,
        project: config.project,
      });
      await confirmDestructiveAction(
        context,
        options,
        `Delete task ${resolved.task.display_ref ?? target}?`,
      );
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

async function resolveTaskRef(
  api: JetApi,
  target: string,
  workspace: string | undefined,
  project: string | undefined,
): Promise<TaskRef> {
  const resolved = await resolveTaskTarget({ api, target, workspace, project });
  return {
    project_key: resolved.projectKey,
    task_number: resolved.taskNumber,
  };
}

export async function resolveParentTaskRef(
  api: JetApi,
  target: string,
  task: TaskCoordinates,
): Promise<TaskRef> {
  return resolveTaskRef(api, target, task.workspaceSlug, task.projectKey);
}

export async function resolveDoneStatus(
  api: JetApi,
  workspaceSlug: string,
  projectKey: string,
): Promise<string> {
  const statuses = await api.listProjectStatuses({ workspaceSlug, projectKey });
  const terminal = statuses.find((status) => status.category === "done");
  if (terminal) {
    return terminal.key;
  }
  const conventional = statuses.find((status) =>
    ["done", "closed", "complete", "completed"].includes(status.key.toLowerCase()),
  );
  if (conventional) {
    return conventional.key;
  }
  throw new CliUsageError(
    "Could not infer a done status for this project. Pass `--status <key>`.",
  );
}
