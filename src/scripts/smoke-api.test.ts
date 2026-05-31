import { describe, expect, test } from "bun:test";

import type { JetApi, Task } from "../api/client.js";
import {
  buildSmokeConfig,
  runSmokeWorkflow,
  shouldRunWriteWorkflow,
} from "./smoke-api.js";

describe("smoke-api helpers", () => {
  test("uses read-only smoke mode by default", () => {
    const config = buildSmokeConfig({
      JET_API_URL: "https://example.test",
      JET_API_KEY: "jet_test",
      JET_WORKSPACE: "acme",
      JET_PROJECT: "JET",
    });

    expect(config).toEqual({
      apiUrl: "https://example.test",
      apiKey: "jet_test",
      workspace: "acme",
      project: "JET",
      write: false,
    });
    expect(shouldRunWriteWorkflow(config)).toBe(false);
  });

  test("enables write workflow only when explicitly requested with context", () => {
    expect(
      shouldRunWriteWorkflow({
        apiUrl: "https://example.test",
        apiKey: "jet_test",
        workspace: "acme",
        project: "JET",
        write: true,
      }),
    ).toBe(true);
    expect(
      shouldRunWriteWorkflow({
        apiUrl: "https://example.test",
        apiKey: "jet_test",
        workspace: "acme",
        write: true,
      }),
    ).toBe(false);
  });

  test("write workflow creates, verifies, and cleans up agent proof tasks", async () => {
    const calls: string[] = [];
    const createdTasks: Task[] = [];
    const api = {
      getCurrentActor: async () => {
        calls.push("me");
        return {};
      },
      listWorkspaces: async () => {
        calls.push("workspaces");
        return [{ slug: "acme" }];
      },
      getWorkspace: async (workspace: string) => {
        calls.push(`workspace:${workspace}`);
        return {};
      },
      getProject: async (args: { workspaceSlug: string; projectKey: string }) => {
        calls.push(`project:${args.workspaceSlug}/${args.projectKey}`);
        return {};
      },
      listProjectTasks: async () => {
        calls.push("tasks:list");
        return [];
      },
      listProjectStatuses: async () => {
        calls.push("statuses:list");
        return [
          {
            key: "done",
            category: "done",
          },
        ];
      },
      listProjectLabels: async () => {
        calls.push("labels:list");
        return [];
      },
      listBoards: async () => {
        calls.push("boards:list");
        return [];
      },
      createTask: async (args: { body: { title: string } }) => {
        const task = makeTask({
          number: createdTasks.length + 1,
          title: args.body.title,
        });
        createdTasks.push(task);
        calls.push(`task:create:${task.number}`);
        return task;
      },
      createTaskComment: async (args: { taskNumber: number }) => {
        calls.push(`comment:create:${args.taskNumber}`);
        return {};
      },
      createTaskReference: async (args: { taskNumber: number }) => {
        calls.push(`reference:create:${args.taskNumber}`);
        return {};
      },
      createTaskLink: async (args: { taskNumber: number; targetTask: unknown }) => {
        calls.push(`link:create:${args.taskNumber}`);
        return {};
      },
      resolveTask: async (args: { target: string }) => {
        calls.push(`resolve:${args.target}`);
        return { status: "resolved", task: createdTasks[0] };
      },
      searchWorkspace: async (args: { q?: string }) => {
        calls.push(`search:${args.q ?? ""}`);
        return { tasks: createdTasks };
      },
      updateTask: async (args: {
        taskNumber: number;
        body: { status_key?: string | null };
      }) => {
        calls.push(`task:update:${args.taskNumber}:${args.body.status_key ?? ""}`);
        return createdTasks.find((task) => task.number === args.taskNumber) ?? createdTasks[0];
      },
      deleteTask: async (args: { taskNumber: number }) => {
        calls.push(`task:delete:${args.taskNumber}`);
      },
    } as unknown as JetApi;

    const result = await runSmokeWorkflow(api, {
      apiUrl: "https://example.test",
      apiKey: "jet_test",
      workspace: "acme",
      project: "JET",
      write: true,
    });

    expect(result.writeWorkflow).toBe(true);
    expect(calls).toContain("task:create:1");
    expect(calls).toContain("task:create:2");
    expect(calls).toContain("comment:create:1");
    expect(calls).toContain("reference:create:1");
    expect(calls).toContain("link:create:1");
    expect(calls).toContain("resolve:JET-1");
    expect(calls).toContain("search:JET agent smoke");
    expect(calls).toContain("task:update:1:done");
    expect(calls.slice(-2)).toEqual(["task:delete:2", "task:delete:1"]);
  });

  test("write workflow attempts all cleanup deletes when one delete fails", async () => {
    const calls: string[] = [];
    const createdTasks: Task[] = [];
    const api = makeWriteWorkflowApi(calls, createdTasks, {
      deleteTask: async (args: { taskNumber: number }) => {
        calls.push(`task:delete:${args.taskNumber}`);
        if (args.taskNumber === 2) {
          throw new Error("delete failed");
        }
      },
    });

    await expect(
      runSmokeWorkflow(api, {
        apiUrl: "https://example.test",
        apiKey: "jet_test",
        workspace: "acme",
        project: "JET",
        write: true,
      }),
    ).rejects.toThrow("delete failed");

    expect(calls.slice(-2)).toEqual(["task:delete:2", "task:delete:1"]);
  });

  test("write workflow preserves the original failure when cleanup also fails", async () => {
    const calls: string[] = [];
    const createdTasks: Task[] = [];
    const api = makeWriteWorkflowApi(calls, createdTasks, {
      updateTask: async (args: {
        taskNumber: number;
        body: { status_key?: string | null };
      }) => {
        calls.push(`task:update:${args.taskNumber}:${args.body.status_key ?? ""}`);
        throw new Error("update failed");
      },
      deleteTask: async (args: { taskNumber: number }) => {
        calls.push(`task:delete:${args.taskNumber}`);
        if (args.taskNumber === 2) {
          throw new Error("delete failed");
        }
      },
    });

    await expect(
      runSmokeWorkflow(api, {
        apiUrl: "https://example.test",
        apiKey: "jet_test",
        workspace: "acme",
        project: "JET",
        write: true,
      }),
    ).rejects.toThrow("update failed");

    expect(calls.slice(-2)).toEqual(["task:delete:2", "task:delete:1"]);
  });
});

function makeTask(overrides: Partial<Task>): Task {
  const number = overrides.number ?? 1;
  return {
    id: `task-${number}`,
    workspace_id: "workspace-id",
    project_id: "project-id",
    project_key: "JET",
    display_ref: `JET-${number}`,
    number,
    title: "JET agent smoke task",
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

function makeWriteWorkflowApi(
  calls: string[],
  createdTasks: Task[],
  overrides: Partial<JetApi> = {},
): JetApi {
  return {
    getCurrentActor: async () => {
      calls.push("me");
      return {};
    },
    listWorkspaces: async () => {
      calls.push("workspaces");
      return [{ slug: "acme" }];
    },
    getWorkspace: async (workspace: string) => {
      calls.push(`workspace:${workspace}`);
      return {};
    },
    getProject: async (args: { workspaceSlug: string; projectKey: string }) => {
      calls.push(`project:${args.workspaceSlug}/${args.projectKey}`);
      return {};
    },
    listProjectTasks: async () => {
      calls.push("tasks:list");
      return [];
    },
    listProjectStatuses: async () => {
      calls.push("statuses:list");
      return [{ key: "done", category: "done" }];
    },
    listProjectLabels: async () => {
      calls.push("labels:list");
      return [];
    },
    listBoards: async () => {
      calls.push("boards:list");
      return [];
    },
    createTask: async (args: { body: { title: string } }) => {
      const task = makeTask({
        number: createdTasks.length + 1,
        title: args.body.title,
      });
      createdTasks.push(task);
      calls.push(`task:create:${task.number}`);
      return task;
    },
    createTaskComment: async (args: { taskNumber: number }) => {
      calls.push(`comment:create:${args.taskNumber}`);
      return {};
    },
    createTaskReference: async (args: { taskNumber: number }) => {
      calls.push(`reference:create:${args.taskNumber}`);
      return {};
    },
    createTaskLink: async (args: { taskNumber: number }) => {
      calls.push(`link:create:${args.taskNumber}`);
      return {};
    },
    resolveTask: async (args: { target: string }) => {
      calls.push(`resolve:${args.target}`);
      return { status: "resolved", task: createdTasks[0] };
    },
    searchWorkspace: async (args: { q?: string }) => {
      calls.push(`search:${args.q ?? ""}`);
      return { tasks: createdTasks };
    },
    updateTask: async (args: { taskNumber: number; body: { status_key?: string } }) => {
      calls.push(`task:update:${args.taskNumber}:${args.body.status_key ?? ""}`);
      return createdTasks.find((task) => task.number === args.taskNumber) ?? createdTasks[0];
    },
    deleteTask: async (args: { taskNumber: number }) => {
      calls.push(`task:delete:${args.taskNumber}`);
    },
    ...overrides,
  } as unknown as JetApi;
}
