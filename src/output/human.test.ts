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

  test("strips terminal control sequences from server-controlled task fields", () => {
    const lines: string[] = [];
    console.log = (...args: unknown[]) => {
      lines.push(args.join(" "));
    };

    printTask({
      ...makeTask(),
      title: "\u001b[31mred title\u001b[0m",
      description: "copy\u001b]52;c;YmFk\u0007text\rhidden",
      labels: [{ key: "p0\u0008x", name: "P0", color: null }],
    });

    const output = lines.join("\n");
    expect(output).toContain("JET-1 red title");
    expect(output).toContain("copytext hidden");
    expect(output).toContain("Labels: p0x");
    expect(output).not.toContain("\u001b");
    expect(output).not.toContain("\u0007");
    expect(output).not.toContain("\u0008");
  });

  test("strips 8-bit C1 terminal control sequences from server-controlled task fields", () => {
    const lines: string[] = [];
    console.log = (...args: unknown[]) => {
      lines.push(args.join(" "));
    };

    printTask({
      ...makeTask(),
      title: "\u009b31mred title\u009b0m",
      description: "copy\u009d52;c;YmFk\u0007text",
    });

    const output = lines.join("\n");
    expect(output).toContain("JET-1 red title");
    expect(output).toContain("copytext");
    expect(output).not.toContain("\u009b");
    expect(output).not.toContain("\u009d");
    expect(output).not.toContain("\u0007");
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
