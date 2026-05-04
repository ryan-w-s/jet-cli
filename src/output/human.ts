import type { Project, Task, TaskComment, Workspace } from "../api/client.js";

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
    console.log(`${taskRef(task).padEnd(12)} ${task.title}`);
  }
}

export function printTask(task: Task): void {
  console.log(`${taskRef(task)} ${task.title}`);
  if (task.description) {
    console.log("");
    console.log(task.description);
  }
  if (task.labels.length > 0) {
    console.log("");
    console.log(`Labels: ${task.labels.map((label) => label.key).join(", ")}`);
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
