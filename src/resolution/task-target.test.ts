import { describe, expect, test } from "bun:test";

import type { JetApi, Task, TaskResolveResult } from "../api/client.js";
import {
  AmbiguousTaskError,
  CliUsageError,
  requireProject,
  requireWorkspace,
  resolveTaskTarget,
} from "./task-target.js";

type GetTaskArgs = Parameters<JetApi["getTask"]>[0];
type ResolveTaskArgs = Parameters<JetApi["resolveTask"]>[0];

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-id",
    workspace_id: "workspace-id",
    project_id: "project-id",
    project_key: "JET",
    display_ref: "JET-1",
    number: 1,
    title: "Fix login",
    description: null,
    parent_task_id: null,
    assignee_user_id: null,
    reporter_user_id: null,
    status_id: null,
    type_id: null,
    priority_id: null,
    labels: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makeApi(options: {
  getTask?: (args: GetTaskArgs) => Promise<Task>;
  resolveTask?: (args: ResolveTaskArgs) => Promise<TaskResolveResult>;
}): JetApi {
  return {
    getTask: options.getTask ?? (async () => makeTask()),
    resolveTask:
      options.resolveTask ??
      (async () => ({ status: "not_found", task: null, candidates: [] })),
  } as JetApi;
}

describe("resolveTaskTarget", () => {
  test("fetches display refs directly in the current workspace", async () => {
    const calls: GetTaskArgs[] = [];
    const api = makeApi({
      getTask: async (args) => {
        calls.push(args);
        return makeTask({ project_key: args.projectKey, number: args.taskNumber });
      },
    });

    const resolved = await resolveTaskTarget({
      api,
      target: "JET-123",
      workspace: "acme",
    });

    expect(calls).toEqual([
      { workspaceSlug: "acme", projectKey: "JET", taskNumber: 123 },
    ]);
    expect(resolved).toMatchObject({
      workspaceSlug: "acme",
      projectKey: "JET",
      taskNumber: 123,
    });
  });

  test("fetches workspace-scoped refs directly", async () => {
    const api = makeApi({
      getTask: async (args) => makeTask({ project_key: args.projectKey }),
    });

    const resolved = await resolveTaskTarget({
      api,
      target: "other/JET-5",
      workspace: "acme",
    });

    expect(resolved).toMatchObject({
      workspaceSlug: "other",
      projectKey: "JET",
      taskNumber: 5,
    });
  });

  test("uses the default project for numeric refs", async () => {
    const api = makeApi({
      getTask: async (args) => makeTask({ project_key: args.projectKey }),
    });

    const resolved = await resolveTaskTarget({
      api,
      target: "42",
      workspace: "acme",
      project: "WEB",
    });

    expect(resolved).toMatchObject({
      workspaceSlug: "acme",
      projectKey: "WEB",
      taskNumber: 42,
    });
  });

  test("falls back to the resolver for title fragments", async () => {
    const calls: ResolveTaskArgs[] = [];
    const api = makeApi({
      resolveTask: async (args) => {
        calls.push(args);
        return {
          status: "resolved",
          task: makeTask({ project_key: "WEB", display_ref: "WEB-7", number: 7 }),
          candidates: [],
        };
      },
    });

    const resolved = await resolveTaskTarget({
      api,
      target: "login",
      workspace: "acme",
      project: "WEB",
    });

    expect(calls).toEqual([
      { workspaceSlug: "acme", target: "login", projectKey: "WEB" },
    ]);
    expect(resolved).toMatchObject({
      workspaceSlug: "acme",
      projectKey: "WEB",
      taskNumber: 7,
    });
  });

  test("throws a dedicated error for ambiguous resolver results", async () => {
    const candidates = [
      makeTask({ display_ref: "JET-1" }),
      makeTask({ project_key: "WEB", display_ref: "WEB-1" }),
    ];
    const api = makeApi({
      resolveTask: async () => ({ status: "ambiguous", task: null, candidates }),
    });

    try {
      await resolveTaskTarget({ api, target: "login", workspace: "acme" });
      throw new Error("Expected an AmbiguousTaskError.");
    } catch (error) {
      expect(error).toBeInstanceOf(AmbiguousTaskError);
      expect((error as AmbiguousTaskError).target).toBe("login");
      expect((error as AmbiguousTaskError).candidates).toEqual(candidates);
    }
  });

  test("throws usage errors for unresolved and malformed resolver results", async () => {
    await expect(
      resolveTaskTarget({
        api: makeApi({
          resolveTask: async () => ({
            status: "not_found",
            task: null,
            candidates: [],
          }),
        }),
        target: "missing",
        workspace: "acme",
      }),
    ).rejects.toThrow(CliUsageError);

    await expect(
      resolveTaskTarget({
        api: makeApi({
          resolveTask: async () => ({
            status: "resolved",
            task: makeTask({ project_key: null }),
            candidates: [],
          }),
        }),
        target: "login",
        workspace: "acme",
      }),
    ).rejects.toThrow("Resolved task did not include a project key.");
  });
});

describe("required task context", () => {
  test("requires a workspace", () => {
    expect(() => requireWorkspace(undefined)).toThrow(CliUsageError);
    expect(requireWorkspace("acme")).toBe("acme");
  });

  test("requires a project", () => {
    expect(() => requireProject(undefined)).toThrow(CliUsageError);
    expect(requireProject("JET")).toBe("JET");
  });
});
