import type { Project, Task, TaskComment, Workspace } from "../api/client.js";
import { printJson } from "./json.js";

const TERMINAL_ESCAPE_PATTERN =
  /\u001b(?:\][^\u0007\u001b]*(?:\u0007|\u001b\\)|\[[0-?]*[ -/]*[@-~])|\u009d[^\u0007\u001b\u009c]*(?:\u0007|\u001b\\|\u009c)|\u009b[0-?]*[ -/]*[@-~]/g;
const UNSAFE_CONTROL_PATTERN = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/g;

export function safeText(value: unknown): string {
  return String(value)
    .replace(TERMINAL_ESCAPE_PATTERN, "")
    .replace(UNSAFE_CONTROL_PATTERN, "")
    .replace(/\r/g, " ");
}

export function taskRef(task: Task): string {
  return safeText(task.display_ref ?? `${task.project_key ?? "TASK"}-${task.number}`);
}

export function printWorkspaces(workspaces: Workspace[]): void {
  if (workspaces.length === 0) {
    console.log("No workspaces found.");
    return;
  }
  for (const workspace of workspaces) {
    console.log(`${safeText(workspace.slug).padEnd(18)} ${safeText(workspace.name)}`);
  }
}

export function printProjects(projects: Project[]): void {
  if (projects.length === 0) {
    console.log("No projects found.");
    return;
  }
  for (const project of projects) {
    console.log(`${safeText(project.key).padEnd(10)} ${safeText(project.name)}`);
  }
}

export function printTasks(tasks: Task[]): void {
  if (tasks.length === 0) {
    console.log("No tasks found.");
    return;
  }
  for (const task of tasks) {
    const taskLabels = task.labels ?? [];
    const labels = taskLabels.length > 0
      ? ` [${taskLabels.map((label) => safeText(label.key)).join(",")}]`
      : "";
    console.log(`${taskRef(task).padEnd(12)} ${safeText(task.title)}${labels}`);
  }
}

export function printTask(task: Task): void {
  console.log(`${taskRef(task)} ${safeText(task.title)}`);
  console.log(`Project: ${safeText(task.project_key ?? "unknown")}`);
  if (task.description) {
    console.log("");
    console.log(safeText(task.description));
  }
  const taskLabels = task.labels ?? [];
  if (taskLabels.length > 0) {
    console.log("");
    console.log(`Labels: ${taskLabels.map((label) => safeText(label.key)).join(", ")}`);
  }
}

export function printComments(comments: TaskComment[]): void {
  if (comments.length === 0) {
    console.log("No comments found.");
    return;
  }
  for (const comment of comments) {
    console.log(`${safeText(comment.created_at)} ${safeText(comment.body)}`);
  }
}

export function printAmbiguousTask(target: string, candidates: Task[]): void {
  console.error(`Task target ${safeText(target)} is ambiguous. Candidates:`);
  for (const candidate of candidates) {
    console.error(`  ${taskRef(candidate)} ${safeText(candidate.title)}`);
  }
}

export function printRecords(records: Record<string, unknown>[], emptyMessage: string): void {
  if (records.length === 0) {
    console.log(emptyMessage);
    return;
  }
  for (const record of records) {
    console.log(recordSummary(record));
  }
}

export function printRecord(record: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(record)) {
    if (value === null || value === undefined) {
      continue;
    }
    const rendered = typeof value === "object" ? JSON.stringify(value) : String(value);
    console.log(`${safeText(key)}: ${safeText(rendered)}`);
  }
}

export function printRecordList(
  output: string | undefined,
  records: unknown[],
  emptyMessage: string,
): void {
  if (output === "json") {
    printJson(records);
    return;
  }
  printRecords(records as Record<string, unknown>[], emptyMessage);
}

export function printRecordValue(
  output: string | undefined,
  record: unknown,
  emptyMessage: string,
): void {
  if (output === "json") {
    printJson(record);
    return;
  }
  printRecords([record as Record<string, unknown>], emptyMessage);
}

function recordSummary(record: Record<string, unknown>): string {
  const key = record["key"] ?? record["slug"] ?? record["id"] ?? record["email"];
  const name = record["name"] ?? record["title"] ?? record["body"] ?? "";
  const suffix = name ? ` ${String(name)}` : "";
  if (key === undefined || key === null) {
    return safeText(JSON.stringify(record));
  }
  return safeText(`${String(key)}${suffix}`);
}
