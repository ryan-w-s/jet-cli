import type { JetApi, Task } from "../api/client.js";

export class CliUsageError extends Error {
  code: string;
  recovery?: string;

  constructor(
    message: string,
    options: { code?: string; recovery?: string } = {},
  ) {
    super(message);
    this.name = "CliUsageError";
    this.code = options.code ?? "usage_error";
    this.recovery = options.recovery;
  }
}

export class AmbiguousTaskError extends Error {
  target: string;
  candidates: Task[];

  constructor(target: string, candidates: Task[]) {
    super(`Task target "${target}" is ambiguous.`);
    this.name = "AmbiguousTaskError";
    this.target = target;
    this.candidates = candidates;
  }
}

export type TaskCoordinates = {
  workspaceSlug: string;
  projectKey: string;
  taskNumber: number;
};

export type ResolveTaskOptions = {
  api: JetApi;
  target: string;
  workspace?: string;
  project?: string;
};

export async function resolveTaskTarget(
  options: ResolveTaskOptions,
): Promise<TaskCoordinates & { task: Task }> {
  const workspaceSlug = requireWorkspace(options.workspace);
  const direct = parseDirectTarget(options.target, workspaceSlug, options.project);
  if (direct !== null) {
    const task = await options.api.getTask(direct);
    return { ...direct, task };
  }

  const result = await options.api.resolveTask({
    workspaceSlug,
    target: options.target,
    projectKey: options.project,
  });
  if (result.status === "resolved" && result.task !== null && result.task !== undefined) {
    return taskToCoordinates(workspaceSlug, result.task);
  }
  if (result.status === "ambiguous") {
    if (!result.candidates || result.candidates.length === 0) {
      throw new CliUsageError(`Task target "${options.target}" is ambiguous, but the API did not return candidates. Try a full task ref such as JET-123.`);
    }
    throw new AmbiguousTaskError(options.target, result.candidates);
  }
  throw new CliUsageError(`No task found for "${options.target}". Try a full ref such as JET-123, or set the default project before using a number.`);
}

export function requireWorkspace(workspace: string | undefined): string {
  if (!workspace) {
    throw new CliUsageError(
      "Workspace is required. Pass --workspace <slug>, set JET_WORKSPACE, or run `jet use workspace <slug>`.",
      {
        code: "missing_workspace",
        recovery:
          "Run `jet workspace list --json`, then `jet use workspace <slug>` or set JET_WORKSPACE.",
      },
    );
  }
  return workspace;
}

export function requireProject(project: string | undefined): string {
  if (!project) {
    throw new CliUsageError(
      "Project is required. Pass --project <key>, set JET_PROJECT, or run `jet use project <key>`.",
      {
        code: "missing_project",
        recovery:
          "Run `jet project list --json`, then `jet use project <key>` or set JET_PROJECT.",
      },
    );
  }
  return project;
}

function parseDirectTarget(
  target: string,
  workspaceSlug: string,
  defaultProject: string | undefined,
): TaskCoordinates | null {
  const workspaceRef = /^(?<workspace>[a-zA-Z0-9_-]+)\/(?<project>[a-zA-Z][a-zA-Z0-9_-]*)-(?<number>\d+)$/.exec(
    target,
  );
  if (workspaceRef?.groups) {
    const { workspace, project, number } = workspaceRef.groups;
    if (!workspace || !project || !number) {
      return null;
    }
    return {
      workspaceSlug: workspace,
      projectKey: project,
      taskNumber: Number(number),
    };
  }

  const displayRef = /^(?<project>[a-zA-Z][a-zA-Z0-9_-]*)-(?<number>\d+)$/.exec(target);
  if (displayRef?.groups) {
    const { project, number } = displayRef.groups;
    if (!project || !number) {
      return null;
    }
    return {
      workspaceSlug,
      projectKey: project,
      taskNumber: Number(number),
    };
  }

  if (/^\d+$/.test(target) && defaultProject) {
    return {
      workspaceSlug,
      projectKey: defaultProject,
      taskNumber: Number(target),
    };
  }

  return null;
}

function taskToCoordinates(
  workspaceSlug: string,
  task: Task,
): TaskCoordinates & { task: Task } {
  if (!task.project_key) {
    throw new CliUsageError("The API resolved the task but did not include its project key. Try a full task ref such as JET-123.");
  }
  return {
    workspaceSlug,
    projectKey: task.project_key,
    taskNumber: task.number,
    task,
  };
}
