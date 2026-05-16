import { describe, expect, test } from "bun:test";

import type { JetApi, Task } from "../api/client.js";
import { CliUsageError } from "../resolution/task-target.js";
import {
  buildTaskSearchOptions,
  parseTaskListSort,
  resolveDoneStatus,
  resolveParentTaskRef,
} from "./task.js";

describe("task command helpers", () => {
  test("resolves parent refs relative to the task being updated", async () => {
    const calls: Parameters<JetApi["getTask"]>[0][] = [];
    const api = {
      getTask: async (args: Parameters<JetApi["getTask"]>[0]) => {
        calls.push(args);
        return makeTask({ project_key: args.projectKey, number: args.taskNumber });
      },
    } as unknown as JetApi;

    await resolveParentTaskRef(api, "42", {
      workspaceSlug: "other-workspace",
      projectKey: "WEB",
      taskNumber: 7,
    });

    expect(calls).toEqual([
      {
        workspaceSlug: "other-workspace",
        projectKey: "WEB",
        taskNumber: 42,
      },
    ]);
  });

  test("uses usage errors when done status cannot be inferred", async () => {
    const api = {
      listProjectStatuses: async () => [
        {
          id: "status-id",
          project_id: "project-id",
          key: "todo",
          name: "Todo",
          category: "open",
          rank: 0,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      ],
    } as unknown as JetApi;

    await expect(resolveDoneStatus(api, "acme", "WEB")).rejects.toThrow(CliUsageError);
  });

  test("builds task search options from list filters and context", () => {
    expect(
      buildTaskSearchOptions({
        workspaceSlug: "acme",
        projectKey: "JET",
        query: "login",
        options: {
          status: "open",
          type: "bug",
          priority: "high",
          label: "backend",
          assignee: "assignee-id",
          reporter: "reporter-id",
          createdAfter: "2026-05-01T00:00:00Z",
          createdBefore: "2026-05-02T00:00:00Z",
          updatedAfter: "2026-05-03T00:00:00Z",
          updatedBefore: "2026-05-04T00:00:00Z",
          sort: "title_asc",
          limit: "25",
          offset: "5",
        },
      }),
    ).toEqual({
      workspaceSlug: "acme",
      q: "login",
      type: "tasks",
      sort: "title_asc",
      projectKey: "JET",
      statusKey: "open",
      typeKey: "bug",
      priorityKey: "high",
      labelKey: "backend",
      assigneeUserId: "assignee-id",
      reporterUserId: "reporter-id",
      createdAfter: "2026-05-01T00:00:00Z",
      createdBefore: "2026-05-02T00:00:00Z",
      updatedAfter: "2026-05-03T00:00:00Z",
      updatedBefore: "2026-05-04T00:00:00Z",
      limit: 25,
      offset: 5,
    });
  });

  test("validates task list sort before calling the API", () => {
    expect(parseTaskListSort("updated_desc")).toBe("updated_desc");
    expect(() => parseTaskListSort("bad-sort")).toThrow(CliUsageError);
  });
});

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-id",
    workspace_id: "workspace-id",
    project_id: "project-id",
    project_key: "WEB",
    display_ref: "WEB-42",
    number: 42,
    title: "Parent task",
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
