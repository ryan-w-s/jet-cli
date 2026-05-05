import { afterEach, describe, expect, test } from "bun:test";

import type { Task } from "../api/client.js";
import { printRecordList, printTask } from "./human.js";

const originalLog = console.log;

afterEach(() => {
  console.log = originalLog;
});

describe("human output", () => {
  test("does not show internal task UUID fields in task details", () => {
    const lines: string[] = [];
    console.log = (...args: unknown[]) => {
      lines.push(args.join(" "));
    };

    printTask(makeTask());

    expect(lines.join("\n")).not.toContain("Status ID:");
    expect(lines.join("\n")).not.toContain("Priority ID:");
    expect(lines.join("\n")).not.toContain("Assignee ID:");
  });

  test("uses a safe fallback for records without summary fields", () => {
    const lines: string[] = [];
    console.log = (...args: unknown[]) => {
      lines.push(args.join(" "));
    };

    printRecordList("human", [{ value: 42 }], "No records found.");

    expect(lines).toEqual(['{"value":42}']);
  });
});

function makeTask(): Task {
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
    assignee_user_id: "assignee-id",
    reporter_user_id: null,
    status_id: "status-id",
    type_id: null,
    priority_id: "priority-id",
    labels: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}
