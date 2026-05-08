import createClient, { type Client } from "openapi-fetch";

import { fingerprintApiKey } from "../cache/fingerprint.js";
import { buildCacheKey } from "../cache/key.js";
import { defaultCacheFile } from "../cache/paths.js";
import {
  cachePolicyForGet,
  invalidationScopesForMutation,
  type CacheContext,
} from "../cache/policy.js";
import { JsonCacheStore, type CacheEntry } from "../cache/store.js";
import type { components, paths } from "../generated/schema.js";

export type AuthActor = components["schemas"]["AuthActorRead"];
export type ApiKey = components["schemas"]["APIKeyRead"];
export type ApiKeyWithSecret = components["schemas"]["APIKeyWithSecret"];
export type ApiKeyCreate = components["schemas"]["APIKeyCreate"];
export type Workspace = components["schemas"]["WorkspaceRead"];
export type WorkspaceCreate = components["schemas"]["WorkspaceCreate"];
export type WorkspaceUpdate = components["schemas"]["WorkspaceUpdate"];
export type WorkspaceMember = components["schemas"]["WorkspaceMemberRead"];
export type WorkspaceInvite = components["schemas"]["WorkspaceInviteRead"];
export type WorkspaceInviteCreate = components["schemas"]["WorkspaceInviteCreate"];
export type Project = components["schemas"]["ProjectRead"];
export type ProjectCreate = components["schemas"]["ProjectCreate"];
export type ProjectUpdate = components["schemas"]["ProjectUpdate"];
export type TaskType = components["schemas"]["TaskTypeRead"];
export type TaskTypeCreate = components["schemas"]["TaskTypeCreate"];
export type TaskTypeUpdate = components["schemas"]["TaskTypeUpdate"];
export type TaskPriority = components["schemas"]["TaskPriorityRead"];
export type TaskPriorityCreate = components["schemas"]["TaskPriorityCreate"];
export type TaskPriorityUpdate = components["schemas"]["TaskPriorityUpdate"];
export type TaskStatus = components["schemas"]["TaskStatusRead"];
export type TaskStatusCreate = components["schemas"]["TaskStatusCreate"];
export type TaskStatusUpdate = components["schemas"]["TaskStatusUpdate"];
export type Label = components["schemas"]["LabelRead"];
export type LabelCreate = components["schemas"]["LabelCreate"];
export type LabelUpdate = components["schemas"]["LabelUpdate"];
export type Task = components["schemas"]["TaskRead"];
export type TaskRef = components["schemas"]["TaskRef"];
export type TaskCreate = components["schemas"]["TaskCreate"];
export type TaskUpdate = components["schemas"]["TaskUpdate"];
export type TaskResolveResult = components["schemas"]["TaskResolveResult"];
export type TaskComment = components["schemas"]["TaskCommentRead"];
export type TaskLink = components["schemas"]["TaskLinkRead"];
export type TaskReference = components["schemas"]["TaskReferenceRead"];
export type Board = components["schemas"]["BoardRead"];
export type BoardCreate = components["schemas"]["BoardCreate"];
export type BoardUpdate = components["schemas"]["BoardUpdate"];

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
  cache?: "on" | "off";
  cacheRefresh?: boolean;
  cacheFile?: string;
  fetch?: (input: Request) => Promise<Response>;
};

export class JetApi {
  private readonly client: Client<paths>;
  private readonly options: Required<Pick<JetApiOptions, "apiUrl" | "apiKey">> &
    Pick<JetApiOptions, "cache" | "cacheRefresh" | "cacheFile">;
  private readonly cacheContext: CacheContext;
  private readonly cacheStore: JsonCacheStore;

  constructor(options: JetApiOptions) {
    const apiUrl = trimTrailingSlash(options.apiUrl);
    this.options = { ...options, apiUrl, apiKey: options.apiKey };
    this.cacheContext = {
      apiUrl,
      apiKeyFingerprint: fingerprintApiKey(options.apiKey),
    };
    this.cacheStore = new JsonCacheStore(options.cacheFile ?? defaultCacheFile());
    this.client = createClient<paths>({
      baseUrl: apiUrl,
      headers: {
        "X-API-Key": options.apiKey,
      },
      fetch: options.fetch,
    });
  }

  async getCurrentActor(): Promise<AuthActor> {
    return this.get("/api/me");
  }

  async listApiKeys(): Promise<ApiKey[]> {
    return this.get("/api/me/api-keys");
  }

  async createApiKey(body: ApiKeyCreate): Promise<ApiKeyWithSecret> {
    return this.post("/api/me/api-keys", {}, body);
  }

  async revokeApiKey(apiKeyId: string): Promise<void> {
    return this.delete("/api/me/api-keys/{api_key_id}", {
      api_key_id: apiKeyId,
    });
  }

  async listWorkspaces(): Promise<Workspace[]> {
    return this.get("/api/workspaces");
  }

  async createWorkspace(body: WorkspaceCreate): Promise<Workspace> {
    return this.post("/api/workspaces", {}, body);
  }

  async getWorkspace(workspaceSlug: string): Promise<Workspace> {
    return this.get("/api/workspaces/{workspace_slug}", {
      workspace_slug: workspaceSlug,
    });
  }

  async updateWorkspace(options: {
    workspaceSlug: string;
    body: WorkspaceUpdate;
  }): Promise<Workspace> {
    return this.patch(
      "/api/workspaces/{workspace_slug}",
      { workspace_slug: options.workspaceSlug },
      options.body,
    );
  }

  async deleteWorkspace(workspaceSlug: string): Promise<void> {
    return this.delete("/api/workspaces/{workspace_slug}", {
      workspace_slug: workspaceSlug,
    });
  }

  async getWorkspaceInvite(inviteId: string): Promise<WorkspaceInvite> {
    return this.get("/api/workspace-invites/{invite_id}", {
      invite_id: inviteId,
    });
  }

  async listWorkspaceMembers(workspaceSlug: string): Promise<WorkspaceMember[]> {
    return this.get("/api/workspaces/{workspace_slug}/members", {
      workspace_slug: workspaceSlug,
    });
  }

  async deleteWorkspaceMember(options: {
    workspaceSlug: string;
    userId: string;
  }): Promise<void> {
    return this.delete("/api/workspaces/{workspace_slug}/members/{user_id}", {
      workspace_slug: options.workspaceSlug,
      user_id: options.userId,
    });
  }

  async listWorkspaceInvites(workspaceSlug: string): Promise<WorkspaceInvite[]> {
    return this.get("/api/workspaces/{workspace_slug}/invites", {
      workspace_slug: workspaceSlug,
    });
  }

  async createWorkspaceInvite(options: {
    workspaceSlug: string;
    body: WorkspaceInviteCreate;
  }): Promise<WorkspaceInvite> {
    return this.post(
      "/api/workspaces/{workspace_slug}/invites",
      { workspace_slug: options.workspaceSlug },
      options.body,
    );
  }

  async deleteWorkspaceInvite(options: {
    workspaceSlug: string;
    inviteId: string;
  }): Promise<void> {
    return this.delete("/api/workspaces/{workspace_slug}/invites/{invite_id}", {
      workspace_slug: options.workspaceSlug,
      invite_id: options.inviteId,
    });
  }

  async acceptWorkspaceInvite(options: {
    workspaceSlug: string;
    inviteId: string;
  }): Promise<Workspace> {
    return this.post(
      "/api/workspaces/{workspace_slug}/invites/{invite_id}/accept",
      {
        workspace_slug: options.workspaceSlug,
        invite_id: options.inviteId,
      },
    );
  }

  async listProjects(workspaceSlug: string): Promise<Project[]> {
    return this.get("/api/workspaces/{workspace_slug}/projects", {
      workspace_slug: workspaceSlug,
    });
  }

  async createProject(options: {
    workspaceSlug: string;
    body: ProjectCreate;
  }): Promise<Project> {
    return this.post(
      "/api/workspaces/{workspace_slug}/projects",
      { workspace_slug: options.workspaceSlug },
      options.body,
    );
  }

  async getProject(options: {
    workspaceSlug: string;
    projectKey: string;
  }): Promise<Project> {
    return this.get("/api/workspaces/{workspace_slug}/projects/{project_key}", {
      workspace_slug: options.workspaceSlug,
      project_key: options.projectKey,
    });
  }

  async updateProject(options: {
    workspaceSlug: string;
    projectKey: string;
    body: ProjectUpdate;
  }): Promise<Project> {
    return this.patch(
      "/api/workspaces/{workspace_slug}/projects/{project_key}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
      },
      options.body,
    );
  }

  async deleteProject(options: {
    workspaceSlug: string;
    projectKey: string;
  }): Promise<void> {
    return this.delete("/api/workspaces/{workspace_slug}/projects/{project_key}", {
      workspace_slug: options.workspaceSlug,
      project_key: options.projectKey,
    });
  }

  async listTaskTypes(workspaceSlug: string): Promise<TaskType[]> {
    return this.get("/api/workspaces/{workspace_slug}/task-types", {
      workspace_slug: workspaceSlug,
    });
  }

  async createTaskType(options: {
    workspaceSlug: string;
    body: TaskTypeCreate;
  }): Promise<TaskType> {
    return this.post(
      "/api/workspaces/{workspace_slug}/task-types",
      { workspace_slug: options.workspaceSlug },
      options.body,
    );
  }

  async getTaskType(options: {
    workspaceSlug: string;
    typeKey: string;
  }): Promise<TaskType> {
    return this.get("/api/workspaces/{workspace_slug}/task-types/{type_key}", {
      workspace_slug: options.workspaceSlug,
      type_key: options.typeKey,
    });
  }

  async updateTaskType(options: {
    workspaceSlug: string;
    typeKey: string;
    body: TaskTypeUpdate;
  }): Promise<TaskType> {
    return this.patch(
      "/api/workspaces/{workspace_slug}/task-types/{type_key}",
      {
        workspace_slug: options.workspaceSlug,
        type_key: options.typeKey,
      },
      options.body,
    );
  }

  async deleteTaskType(options: {
    workspaceSlug: string;
    typeKey: string;
  }): Promise<void> {
    return this.delete("/api/workspaces/{workspace_slug}/task-types/{type_key}", {
      workspace_slug: options.workspaceSlug,
      type_key: options.typeKey,
    });
  }

  async listTaskPriorities(workspaceSlug: string): Promise<TaskPriority[]> {
    return this.get("/api/workspaces/{workspace_slug}/task-priorities", {
      workspace_slug: workspaceSlug,
    });
  }

  async createTaskPriority(options: {
    workspaceSlug: string;
    body: TaskPriorityCreate;
  }): Promise<TaskPriority> {
    return this.post(
      "/api/workspaces/{workspace_slug}/task-priorities",
      { workspace_slug: options.workspaceSlug },
      options.body,
    );
  }

  async getTaskPriority(options: {
    workspaceSlug: string;
    priorityKey: string;
  }): Promise<TaskPriority> {
    return this.get(
      "/api/workspaces/{workspace_slug}/task-priorities/{priority_key}",
      {
        workspace_slug: options.workspaceSlug,
        priority_key: options.priorityKey,
      },
    );
  }

  async updateTaskPriority(options: {
    workspaceSlug: string;
    priorityKey: string;
    body: TaskPriorityUpdate;
  }): Promise<TaskPriority> {
    return this.patch(
      "/api/workspaces/{workspace_slug}/task-priorities/{priority_key}",
      {
        workspace_slug: options.workspaceSlug,
        priority_key: options.priorityKey,
      },
      options.body,
    );
  }

  async deleteTaskPriority(options: {
    workspaceSlug: string;
    priorityKey: string;
  }): Promise<void> {
    return this.delete(
      "/api/workspaces/{workspace_slug}/task-priorities/{priority_key}",
      {
        workspace_slug: options.workspaceSlug,
        priority_key: options.priorityKey,
      },
    );
  }

  async listProjectStatuses(options: {
    workspaceSlug: string;
    projectKey: string;
  }): Promise<TaskStatus[]> {
    return this.get(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
      },
    );
  }

  async createTaskStatus(options: {
    workspaceSlug: string;
    projectKey: string;
    body: TaskStatusCreate;
  }): Promise<TaskStatus> {
    return this.post(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
      },
      options.body,
    );
  }

  async getTaskStatus(options: {
    workspaceSlug: string;
    projectKey: string;
    statusKey: string;
  }): Promise<TaskStatus> {
    return this.get(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses/{status_key}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        status_key: options.statusKey,
      },
    );
  }

  async updateTaskStatus(options: {
    workspaceSlug: string;
    projectKey: string;
    statusKey: string;
    body: TaskStatusUpdate;
  }): Promise<TaskStatus> {
    return this.patch(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses/{status_key}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        status_key: options.statusKey,
      },
      options.body,
    );
  }

  async deleteTaskStatus(options: {
    workspaceSlug: string;
    projectKey: string;
    statusKey: string;
  }): Promise<void> {
    return this.delete(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses/{status_key}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        status_key: options.statusKey,
      },
    );
  }

  async listProjectLabels(options: {
    workspaceSlug: string;
    projectKey: string;
  }): Promise<Label[]> {
    return this.get("/api/workspaces/{workspace_slug}/projects/{project_key}/labels", {
      workspace_slug: options.workspaceSlug,
      project_key: options.projectKey,
    });
  }

  async createLabel(options: {
    workspaceSlug: string;
    projectKey: string;
    body: LabelCreate;
  }): Promise<Label> {
    return this.post(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/labels",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
      },
      options.body,
    );
  }

  async getLabel(options: {
    workspaceSlug: string;
    projectKey: string;
    labelKey: string;
  }): Promise<Label> {
    return this.get(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/labels/{label_key}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        label_key: options.labelKey,
      },
    );
  }

  async updateLabel(options: {
    workspaceSlug: string;
    projectKey: string;
    labelKey: string;
    body: LabelUpdate;
  }): Promise<Label> {
    return this.patch(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/labels/{label_key}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        label_key: options.labelKey,
      },
      options.body,
    );
  }

  async deleteLabel(options: {
    workspaceSlug: string;
    projectKey: string;
    labelKey: string;
  }): Promise<void> {
    return this.delete(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/labels/{label_key}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        label_key: options.labelKey,
      },
    );
  }

  async listWorkspaceTasks(options: {
    workspaceSlug: string;
    projectKey?: string;
    statusKey?: string;
    assigneeUserId?: string;
    q?: string;
  }): Promise<Task[]> {
    return this.get(
      "/api/workspaces/{workspace_slug}/tasks",
      { workspace_slug: options.workspaceSlug },
      {
        projectKey: options.projectKey,
        statusKey: options.statusKey,
        assigneeUserId: options.assigneeUserId,
        q: options.q,
      },
    );
  }

  async listProjectTasks(options: {
    workspaceSlug: string;
    projectKey: string;
  }): Promise<Task[]> {
    return this.get("/api/workspaces/{workspace_slug}/projects/{project_key}/tasks", {
      workspace_slug: options.workspaceSlug,
      project_key: options.projectKey,
    });
  }

  async resolveTask(options: {
    workspaceSlug: string;
    target: string;
    projectKey?: string;
  }): Promise<TaskResolveResult> {
    return this.get(
      "/api/workspaces/{workspace_slug}/tasks/resolve",
      { workspace_slug: options.workspaceSlug },
      {
        target: options.target,
        projectKey: options.projectKey,
      },
    );
  }

  async getTask(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
  }): Promise<Task> {
    return this.get(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        task_number: options.taskNumber,
      },
    );
  }

  async createTask(options: {
    workspaceSlug: string;
    projectKey: string;
    body: TaskCreate;
  }): Promise<Task> {
    return this.post(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
      },
      options.body,
    );
  }

  async updateTask(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
    body: TaskUpdate;
  }): Promise<Task> {
    return this.patch(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        task_number: options.taskNumber,
      },
      options.body,
    );
  }

  async deleteTask(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
  }): Promise<void> {
    return this.delete(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        task_number: options.taskNumber,
      },
    );
  }

  async listTaskComments(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
  }): Promise<TaskComment[]> {
    return this.get(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/comments",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        task_number: options.taskNumber,
      },
    );
  }

  async createTaskComment(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
    body: string;
  }): Promise<TaskComment> {
    return this.post(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/comments",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        task_number: options.taskNumber,
      },
      { body: options.body },
    );
  }

  async updateTaskComment(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
    commentId: string;
    body: string;
  }): Promise<TaskComment> {
    return this.patch(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/comments/{comment_id}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        task_number: options.taskNumber,
        comment_id: options.commentId,
      },
      { body: options.body },
    );
  }

  async deleteTaskComment(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
    commentId: string;
  }): Promise<void> {
    return this.delete(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/comments/{comment_id}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        task_number: options.taskNumber,
        comment_id: options.commentId,
      },
    );
  }

  async listTaskLinks(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
  }): Promise<TaskLink[]> {
    return this.get(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/links",
      taskPath(options),
    );
  }

  async createTaskLink(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
    targetTask: TaskRef;
    relationshipType?: string;
  }): Promise<TaskLink> {
    return this.post(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/links",
      taskPath(options),
      {
        target_task: options.targetTask,
        relationship_type: options.relationshipType ?? "relates_to",
      },
    );
  }

  async updateTaskLink(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
    linkId: string;
    relationshipType: string;
  }): Promise<TaskLink> {
    return this.patch(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/links/{link_id}",
      { ...taskPath(options), link_id: options.linkId },
      { relationship_type: options.relationshipType },
    );
  }

  async deleteTaskLink(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
    linkId: string;
  }): Promise<void> {
    return this.delete(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/links/{link_id}",
      { ...taskPath(options), link_id: options.linkId },
    );
  }

  async listTaskReferences(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
  }): Promise<TaskReference[]> {
    return this.get(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/references",
      taskPath(options),
    );
  }

  async createTaskReference(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
    title?: string;
    url: string;
  }): Promise<TaskReference> {
    return this.post(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/references",
      taskPath(options),
      { title: options.title, url: options.url },
    );
  }

  async updateTaskReference(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
    referenceId: string;
    title?: string;
    url: string;
  }): Promise<TaskReference> {
    return this.patch(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/references/{reference_id}",
      { ...taskPath(options), reference_id: options.referenceId },
      { title: options.title, url: options.url },
    );
  }

  async deleteTaskReference(options: {
    workspaceSlug: string;
    projectKey: string;
    taskNumber: number;
    referenceId: string;
  }): Promise<void> {
    return this.delete(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/references/{reference_id}",
      { ...taskPath(options), reference_id: options.referenceId },
    );
  }

  async listBoards(options: {
    workspaceSlug: string;
    projectKey: string;
  }): Promise<Board[]> {
    return this.get("/api/workspaces/{workspace_slug}/projects/{project_key}/boards", {
      workspace_slug: options.workspaceSlug,
      project_key: options.projectKey,
    });
  }

  async createBoard(options: {
    workspaceSlug: string;
    projectKey: string;
    body: BoardCreate;
  }): Promise<Board> {
    return this.post(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/boards",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
      },
      options.body,
    );
  }

  async getBoard(options: {
    workspaceSlug: string;
    projectKey: string;
    boardKey: string;
  }): Promise<Board> {
    return this.get(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/boards/{board_key}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        board_key: options.boardKey,
      },
    );
  }

  async updateBoard(options: {
    workspaceSlug: string;
    projectKey: string;
    boardKey: string;
    body: BoardUpdate;
  }): Promise<Board> {
    return this.patch(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/boards/{board_key}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        board_key: options.boardKey,
      },
      options.body,
    );
  }

  async deleteBoard(options: {
    workspaceSlug: string;
    projectKey: string;
    boardKey: string;
  }): Promise<void> {
    return this.delete(
      "/api/workspaces/{workspace_slug}/projects/{project_key}/boards/{board_key}",
      {
        workspace_slug: options.workspaceSlug,
        project_key: options.projectKey,
        board_key: options.boardKey,
      },
    );
  }

  private async get<T>(
    path: keyof paths,
    pathParams: Record<string, unknown> = {},
    queryParams?: Record<string, unknown>,
  ): Promise<T> {
    const policy = cachePolicyForGet(this.cacheContext, path, pathParams);
    const cacheKey =
      policy === undefined
        ? undefined
        : buildCacheKey({
            apiUrl: this.cacheContext.apiUrl,
            apiKeyFingerprint: this.cacheContext.apiKeyFingerprint,
            method: "GET",
            path,
            pathParams,
            queryParams,
          });
    if (this.options.cache !== "off" && !this.options.cacheRefresh && policy && cacheKey) {
      const cached = await this.cacheStore.get(cacheKey);
      if (cached) {
        return cached.body as T;
      }
    }

    const { data, error, response } = await (this.client.GET as HttpMethod)(path, {
      params: { path: pathParams, query: queryParams },
    });
    const unwrapped = unwrap(data as T | undefined, error, response);
    if (this.options.cache !== "off" && policy && cacheKey) {
      await this.cacheStore.set({
        key: cacheKey,
        scope: policy.scope,
        createdAt: Date.now(),
        expiresAt: Date.now() + policy.ttlMs,
        status: response.status,
        headers: headersToRecord(response.headers),
        body: unwrapped,
      });
    }
    return unwrapped;
  }

  private async post<T>(
    path: keyof paths,
    pathParams: Record<string, unknown> = {},
    body?: unknown,
  ): Promise<T> {
    const { data, error, response } = await (this.client.POST as HttpMethod)(path, {
      params: { path: pathParams },
      body,
    });
    const unwrapped = unwrap(data as T | undefined, error, response);
    await this.invalidateAfterMutation(path, pathParams);
    return unwrapped;
  }

  private async patch<T>(
    path: keyof paths,
    pathParams: Record<string, unknown>,
    body: unknown,
  ): Promise<T> {
    const { data, error, response } = await (this.client.PATCH as HttpMethod)(path, {
      params: { path: pathParams },
      body,
    });
    const unwrapped = unwrap(data as T | undefined, error, response);
    await this.invalidateAfterMutation(path, pathParams);
    return unwrapped;
  }

  private async delete(
    path: keyof paths,
    pathParams: Record<string, unknown>,
  ): Promise<void> {
    const { data, error, response } = await (this.client.DELETE as HttpMethod)(path, {
      params: { path: pathParams },
    });
    unwrap(data as void | undefined, error, response);
    await this.invalidateAfterMutation(path, pathParams);
  }

  private async invalidateAfterMutation(
    path: keyof paths,
    pathParams: Record<string, unknown>,
  ): Promise<void> {
    if (this.options.cache === "off") {
      return;
    }
    const scopes = invalidationScopesForMutation(this.cacheContext, path, pathParams);
    await Promise.all(
      scopes.map((scope) => this.cacheStore.deleteByScopePrefix(scope)),
    );
  }
}

type HttpMethod = (
  path: keyof paths,
  options?: Record<string, unknown>,
) => Promise<{ data?: unknown; error?: unknown; response: Response }>;

function taskPath(options: {
  workspaceSlug: string;
  projectKey: string;
  taskNumber: number;
}): Record<string, unknown> {
  return {
    workspace_slug: options.workspaceSlug,
    project_key: options.projectKey,
    task_number: options.taskNumber,
  };
}

function headersToRecord(headers: Headers): CacheEntry["headers"] {
  return Object.fromEntries(headers.entries());
}

export function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function unwrap<T>(data: T | undefined, error: unknown, response: Response): T {
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
