import { describe, expect, test } from "bun:test";

import { rootScope } from "./key.js";
import { cachePolicyForGet, invalidationScopesForMutation } from "./policy.js";

const context = {
  apiUrl: "https://api.example.test",
  apiKeyFingerprint: "abc123",
};

describe("cachePolicyForGet", () => {
  test("caches project metadata under project scopes", () => {
    const policy = cachePolicyForGet(
      context,
      "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses",
      { workspace_slug: "acme", project_key: "JET" },
    );

    expect(policy?.ttlMs).toBeGreaterThan(0);
    expect(policy?.scope).toContain("statuses");
    expect(policy?.scope).toContain("JET");
  });

  test("cache scopes remain under the current API key root scope", () => {
    const root = rootScope(context.apiUrl, context.apiKeyFingerprint);
    const policy = cachePolicyForGet(
      context,
      "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses",
      { workspace_slug: "acme", project_key: "JET" },
    );

    expect(policy?.scope).toStartWith(`${root}/`);
  });

  test("does not cache task lists by default", () => {
    expect(
      cachePolicyForGet(context, "/api/workspaces/{workspace_slug}/tasks", {
        workspace_slug: "acme",
      }),
    ).toBeUndefined();
  });
});

describe("invalidationScopesForMutation", () => {
  test("invalidates project metadata after status mutations", () => {
    const scopes = invalidationScopesForMutation(
      context,
      "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses/{status_key}",
      { workspace_slug: "acme", project_key: "JET", status_key: "done" },
    );

    expect(scopes.some((scope) => scope.includes("statuses"))).toBe(true);
  });

  test("invalidates task resolver and task scopes for task mutations", () => {
    const scopes = invalidationScopesForMutation(
      context,
      "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}",
      { workspace_slug: "acme", project_key: "JET", task_number: 1 },
    );

    expect(scopes.some((scope) => scope.includes("task-resolution"))).toBe(true);
    expect(scopes.some((scope) => scope.includes("tasks"))).toBe(true);
  });
});
