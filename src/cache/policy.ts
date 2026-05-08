import type { paths } from "../generated/schema.js";
import { childScope, rootScope } from "./key.js";

export type CacheContext = {
  apiUrl: string;
  apiKeyFingerprint: string;
};

export type CachePolicy = {
  ttlMs: number;
  scope: string;
};

const MINUTE = 60_000;

export function cachePolicyForGet(
  context: CacheContext,
  path: keyof paths,
  pathParams: Record<string, unknown> = {},
): CachePolicy | undefined {
  const base = rootScope(context.apiUrl, context.apiKeyFingerprint);
  const workspaceSlug = stringParam(pathParams, "workspace_slug");
  const projectKey = stringParam(pathParams, "project_key");

  switch (path) {
    case "/api/workspaces":
      return { ttlMs: 10 * MINUTE, scope: childScope(base, "workspaces") };
    case "/api/workspaces/{workspace_slug}":
      return workspaceSlug
        ? { ttlMs: 10 * MINUTE, scope: workspaceScope(base, workspaceSlug) }
        : undefined;
    case "/api/workspaces/{workspace_slug}/projects":
      return workspaceSlug
        ? { ttlMs: 10 * MINUTE, scope: childScope(workspaceScope(base, workspaceSlug), "projects") }
        : undefined;
    case "/api/workspaces/{workspace_slug}/projects/{project_key}":
      return workspaceSlug && projectKey
        ? { ttlMs: 10 * MINUTE, scope: projectScope(base, workspaceSlug, projectKey) }
        : undefined;
    case "/api/workspaces/{workspace_slug}/task-types":
    case "/api/workspaces/{workspace_slug}/task-types/{type_key}":
      return workspaceSlug
        ? { ttlMs: 20 * MINUTE, scope: childScope(workspaceScope(base, workspaceSlug), "task-types") }
        : undefined;
    case "/api/workspaces/{workspace_slug}/task-priorities":
    case "/api/workspaces/{workspace_slug}/task-priorities/{priority_key}":
      return workspaceSlug
        ? { ttlMs: 20 * MINUTE, scope: childScope(workspaceScope(base, workspaceSlug), "task-priorities") }
        : undefined;
    case "/api/workspaces/{workspace_slug}/members":
    case "/api/workspaces/{workspace_slug}/invites":
      return workspaceSlug
        ? { ttlMs: 2 * MINUTE, scope: childScope(workspaceScope(base, workspaceSlug), "members") }
        : undefined;
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses":
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses/{status_key}":
      return workspaceSlug && projectKey
        ? { ttlMs: 15 * MINUTE, scope: childScope(projectScope(base, workspaceSlug, projectKey), "statuses") }
        : undefined;
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/labels":
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/labels/{label_key}":
      return workspaceSlug && projectKey
        ? { ttlMs: 15 * MINUTE, scope: childScope(projectScope(base, workspaceSlug, projectKey), "labels") }
        : undefined;
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/boards":
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/boards/{board_key}":
      return workspaceSlug && projectKey
        ? { ttlMs: 15 * MINUTE, scope: childScope(projectScope(base, workspaceSlug, projectKey), "boards") }
        : undefined;
    case "/api/workspaces/{workspace_slug}/tasks/resolve":
      return workspaceSlug
        ? { ttlMs: 45_000, scope: childScope(workspaceScope(base, workspaceSlug), "task-resolution") }
        : undefined;
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}":
      return workspaceSlug && projectKey
        ? { ttlMs: 10_000, scope: childScope(projectScope(base, workspaceSlug, projectKey), "tasks") }
        : undefined;
    default:
      return undefined;
  }
}

export function invalidationScopesForMutation(
  context: CacheContext,
  path: keyof paths,
  pathParams: Record<string, unknown> = {},
): string[] {
  const base = rootScope(context.apiUrl, context.apiKeyFingerprint);
  const workspaceSlug = stringParam(pathParams, "workspace_slug");
  const projectKey = stringParam(pathParams, "project_key");
  const scopes = new Set<string>();

  switch (path) {
    case "/api/workspaces":
      scopes.add(childScope(base, "workspaces"));
      break;
    case "/api/workspaces/{workspace_slug}":
      scopes.add(childScope(base, "workspaces"));
      if (workspaceSlug) {
        scopes.add(workspaceScope(base, workspaceSlug));
      }
      break;
    case "/api/workspaces/{workspace_slug}/projects":
    case "/api/workspaces/{workspace_slug}/projects/{project_key}":
      if (workspaceSlug) {
        scopes.add(childScope(workspaceScope(base, workspaceSlug), "projects"));
      }
      if (workspaceSlug && projectKey) {
        scopes.add(projectScope(base, workspaceSlug, projectKey));
      }
      break;
    case "/api/workspaces/{workspace_slug}/task-types":
    case "/api/workspaces/{workspace_slug}/task-types/{type_key}":
      if (workspaceSlug) {
        scopes.add(childScope(workspaceScope(base, workspaceSlug), "task-types"));
      }
      break;
    case "/api/workspaces/{workspace_slug}/task-priorities":
    case "/api/workspaces/{workspace_slug}/task-priorities/{priority_key}":
      if (workspaceSlug) {
        scopes.add(childScope(workspaceScope(base, workspaceSlug), "task-priorities"));
      }
      break;
    case "/api/workspaces/{workspace_slug}/members/{user_id}":
    case "/api/workspaces/{workspace_slug}/invites":
    case "/api/workspaces/{workspace_slug}/invites/{invite_id}":
    case "/api/workspaces/{workspace_slug}/invites/{invite_id}/accept":
      if (workspaceSlug) {
        scopes.add(childScope(workspaceScope(base, workspaceSlug), "members"));
      }
      break;
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses":
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses/{status_key}":
      addProjectMetadataScope(scopes, base, workspaceSlug, projectKey, "statuses");
      break;
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/labels":
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/labels/{label_key}":
      addProjectMetadataScope(scopes, base, workspaceSlug, projectKey, "labels");
      break;
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/boards":
    case "/api/workspaces/{workspace_slug}/projects/{project_key}/boards/{board_key}":
      addProjectMetadataScope(scopes, base, workspaceSlug, projectKey, "boards");
      break;
    default:
      if (workspaceSlug) {
        scopes.add(childScope(workspaceScope(base, workspaceSlug), "task-resolution"));
      }
      if (workspaceSlug && projectKey) {
        scopes.add(childScope(projectScope(base, workspaceSlug, projectKey), "tasks"));
      }
      break;
  }

  return [...scopes];
}

function addProjectMetadataScope(
  scopes: Set<string>,
  base: string,
  workspaceSlug: string | undefined,
  projectKey: string | undefined,
  name: string,
): void {
  if (workspaceSlug && projectKey) {
    scopes.add(childScope(projectScope(base, workspaceSlug, projectKey), name));
  }
}

function workspaceScope(base: string, workspaceSlug: string): string {
  return childScope(base, "workspace", workspaceSlug);
}

function projectScope(base: string, workspaceSlug: string, projectKey: string): string {
  return childScope(workspaceScope(base, workspaceSlug), "project", projectKey);
}

function stringParam(
  params: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = params[key];
  return typeof value === "string" ? value : undefined;
}
