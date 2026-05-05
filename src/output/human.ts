import type { Project, Task, TaskComment, Workspace } from "../api/client.js";
import { printJson } from "./json.js";

export function taskRef(task: Task): string {
  return task.display_ref ?? `${task.project_key ?? "TASK"}-${task.number}`;
}

export function printWorkspaces(workspaces: Workspace[]): void {
  if (workspaces.length === 0) {
    console.log("No workspaces found.");
    return;
  }
  for (const workspace of workspaces) {
    console.log(`${workspace.slug.padEnd(18)} ${workspace.name}`);
  }
}

export function printProjects(projects: Project[]): void {
  if (projects.length === 0) {
    console.log("No projects found.");
    return;
  }
  for (const project of projects) {
    console.log(`${project.key.padEnd(10)} ${project.name}`);
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
      ? ` [${taskLabels.map((label) => label.key).join(",")}]`
      : "";
    console.log(`${taskRef(task).padEnd(12)} ${task.title}${labels}`);
  }
}

export function printTask(task: Task): void {
  console.log(`${taskRef(task)} ${task.title}`);
  console.log(`Project: ${task.project_key ?? "unknown"}`);
  if (task.description) {
    console.log("");
    console.log(task.description);
  }
  const taskLabels = task.labels ?? [];
  if (taskLabels.length > 0) {
    console.log("");
    console.log(`Labels: ${taskLabels.map((label) => label.key).join(", ")}`);
  }
}

export function printComments(comments: TaskComment[]): void {
  if (comments.length === 0) {
    console.log("No comments found.");
    return;
  }
  for (const comment of comments) {
    console.log(`${comment.created_at} ${comment.body}`);
  }
}

export function printAmbiguousTask(target: string, candidates: Task[]): void {
  console.error(`Task target "${target}" is ambiguous. Candidates:`);
  for (const candidate of candidates) {
    console.error(`  ${taskRef(candidate)} ${candidate.title}`);
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
    console.log(`${key}: ${rendered}`);
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
    return JSON.stringify(record);
  }
  return `${String(key)}${suffix}`;
}
