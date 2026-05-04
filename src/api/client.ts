import createClient, { type Client } from "openapi-fetch";

import type { components, paths } from "../generated/schema.js";

export type AuthActor = components["schemas"]["AuthActorRead"];
export type Workspace = components["schemas"]["WorkspaceRead"];
export type Project = components["schemas"]["ProjectRead"];
export type Task = components["schemas"]["TaskRead"];
export type TaskCreate = components["schemas"]["TaskCreate"];
export type TaskUpdate = components["schemas"]["TaskUpdate"];
export type TaskResolveResult = components["schemas"]["TaskResolveResult"];
export type TaskComment = components["schemas"]["TaskCommentRead"];

export class JetApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "JetApiError";
    this.status = status;
    this.detail = detail;
  }
}

export type JetApiOptions = {
  apiUrl: string;
  apiKey: string;
};

export class JetApi {
  private readonly client: Client<paths>;

  constructor(options: JetApiOptions) {
    this.client = createClient<paths>({
      baseUrl: trimTrailingSlash(options.apiUrl),
      headers: {
        "X-API-Key": options.apiKey,
      },
    });
  }

  async getCurrentActor(): Promise<AuthActor> {
    const { data, error, response } = await this.client.GET("/api/me");
    return unwrap(data, error, response);
  }

  async listWorkspaces(): Promise<Workspace[]> {
    const { data, error, response } = await this.client.GET("/api/workspaces");
    return unwrap(data, error, response);
  }

  async listProjects(workspaceSlug: string): Promise<Project[]> {
    const { data, error, response } = await this.client.GET(
      "/api/workspaces/{workspace_slug}/projects",
      {
        params: {
          path: { workspace_slug: workspaceSlug },
        },
      },
    );
    return unwrap(data, error, response);
  }

  async listWorkspaceTasks(options: {
    workspaceSlug: string;
    projectKey?: string;
    statusKey?: string;
    assigneeUserId?: string;
    q?: string;
  }): Promise<Task[]> {
    const { data, error, response } = await this.client.GET(
      "/api/workspaces/{workspace_slug}/tasks",
      {
        params: {
          path: { workspace_slug: options.workspaceSlug },
          query: {
            projectKey: options.projectKey,
            statusKey: options.statusKey,
            assigneeUserId: options.assigneeUserId,
            q: options.q,
          },
        },
      },
    );
    return unwrap(data, error, response);
  }

  async resolveTask(options: {
    workspaceSlug: string;
    target: string;
    projectKey?: string;
  }): Promise<TaskResolveResult> {
    const { data, error, response } = await this.client.GET(
      "/api/workspaces/{workspace_slug}/tasks/resolve",
      {
        params: {
          path: { workspace_slug: options.workspaceSlug },
          query: {
            target: options.target,
            projectKey: options.projectKey,
          },
        },
      },
    );
    return unwrap(data, error, response);
  }

  async getTask(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
  }): Promise<Task> {
    const { data, error, response } = await this.client.GET(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}",
      {
        params: {
          path: {
            workspace_slug: options.workspaceSlug,
            project_key: options.projectKey,
            task_number: options.taskNumber,
          },
        },
      },
    );
    return unwrap(data, error, response);
  }

  async createTask(options: {
    workspaceSlug: string;
    projectKey: string;
    body: TaskCreate;
  }): Promise<Task> {
    const { data, error, response } = await this.client.POST(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks",
      {
        params: {
          path: {
            workspace_slug: options.workspaceSlug,
            project_key: options.projectKey,
          },
        },
        body: options.body,
      },
    );
    return unwrap(data, error, response);
  }

  async updateTask(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
    body: TaskUpdate;
  }): Promise<Task> {
    const { data, error, response } = await this.client.PATCH(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}",
      {
        params: {
          path: {
            workspace_slug: options.workspaceSlug,
            project_key: options.projectKey,
            task_number: options.taskNumber,
          },
        },
        body: options.body,
      },
    );
    return unwrap(data, error, response);
  }

  async deleteTask(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
  }): Promise<void> {
    const { error, response } = await this.client.DELETE(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}",
      {
        params: {
          path: {
            workspace_slug: options.workspaceSlug,
            project_key: options.projectKey,
            task_number: options.taskNumber,
          },
        },
      },
    );
    unwrap(undefined, error, response);
  }

  async listTaskComments(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
  }): Promise<TaskComment[]> {
    const { data, error, response } = await this.client.GET(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/comments",
      {
        params: {
          path: {
            workspace_slug: options.workspaceSlug,
            project_key: options.projectKey,
            task_number: options.taskNumber,
          },
        },
      },
    );
    return unwrap(data, error, response);
  }

  async createTaskComment(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
    body: string;
  }): Promise<TaskComment> {
    const { data, error, response } = await this.client.POST(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/comments",
      {
        params: {
          path: {
            workspace_slug: options.workspaceSlug,
            project_key: options.projectKey,
            task_number: options.taskNumber,
          },
        },
        body: { body: options.body },
      },
    );
    return unwrap(data, error, response);
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function unwrap<T>(data: T | undefined, error: unknown, response: Response): T {
  if (error !== undefined) {
    throw new JetApiError(apiErrorMessage(error, response), response.status, error);
  }
  if (data === undefined && response.status !== 204) {
    throw new JetApiError("API response did not include a body.", response.status, error);
  }
  return data as T;
}

function apiErrorMessage(error: unknown, response: Response): string {
  if (isApiErrorDetail(error)) {
    if (typeof error.detail === "string") {
      return error.detail;
    }
    return JSON.stringify(error.detail);
  }
  return `JET API request failed with HTTP ${response.status}.`;
}

function isApiErrorDetail(value: unknown): value is { detail: unknown } {
  return typeof value === "object" && value !== null && "detail" in value;
}
