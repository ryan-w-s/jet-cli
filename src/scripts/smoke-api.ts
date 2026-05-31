import { JetApi, type Task, type TaskStatus } from "../api/client.js";

export type SmokeConfig = {
  apiUrl?: string;
  apiKey?: string;
  workspace?: string;
  project?: string;
  write: boolean;
};

export type SmokeResult = {
  visibleWorkspaces: number;
  writeWorkflow: boolean;
};

type SmokeApi = Pick<
  JetApi,
  | "getCurrentActor"
  | "listWorkspaces"
  | "getWorkspace"
  | "getProject"
  | "listProjectTasks"
  | "listProjectStatuses"
  | "listProjectLabels"
  | "listBoards"
  | "createTask"
  | "createTaskComment"
  | "createTaskReference"
  | "createTaskLink"
  | "resolveTask"
  | "searchWorkspace"
  | "updateTask"
  | "deleteTask"
>;

export function buildSmokeConfig(env: NodeJS.ProcessEnv): SmokeConfig {
  return {
    apiUrl: env["JET_SMOKE_API_URL"] ?? env["JET_API_URL"],
    apiKey: env["JET_SMOKE_API_KEY"] ?? env["JET_API_KEY"],
    workspace: env["JET_SMOKE_WORKSPACE"] ?? env["JET_WORKSPACE"],
    project: env["JET_SMOKE_PROJECT"] ?? env["JET_PROJECT"],
    write: env["JET_SMOKE_WRITE"] === "1" || env["JET_SMOKE_WRITE"] === "true",
  };
}

export function shouldRunWriteWorkflow(config: SmokeConfig): boolean {
  return Boolean(config.write && config.workspace && config.project);
}

export async function runSmokeWorkflow(
  api: SmokeApi,
  config: SmokeConfig,
): Promise<SmokeResult> {
  await api.getCurrentActor();
  const workspaces = await api.listWorkspaces();

  if (config.workspace) {
    await api.getWorkspace(config.workspace);
  }

  if (config.workspace && config.project) {
    await api.getProject({
      workspaceSlug: config.workspace,
      projectKey: config.project,
    });
    await Promise.all([
      api.listProjectTasks({
        workspaceSlug: config.workspace,
        projectKey: config.project,
      }),
      api.listProjectStatuses({
        workspaceSlug: config.workspace,
        projectKey: config.project,
      }),
      api.listProjectLabels({
        workspaceSlug: config.workspace,
        projectKey: config.project,
      }),
      api.listBoards({
        workspaceSlug: config.workspace,
        projectKey: config.project,
      }),
    ]);
  }

  if (shouldRunWriteWorkflow(config)) {
    await runWriteWorkflow(
      api,
      config.workspace as string,
      config.project as string,
    );
    return { visibleWorkspaces: workspaces.length, writeWorkflow: true };
  }

  return { visibleWorkspaces: workspaces.length, writeWorkflow: false };
}

async function runWriteWorkflow(
  api: SmokeApi,
  workspaceSlug: string,
  projectKey: string,
): Promise<void> {
  const created: Task[] = [];
  const stamp = new Date().toISOString();
  let workflowError: unknown;
  try {
    const first = await api.createTask({
      workspaceSlug,
      projectKey,
      body: {
        title: `JET agent smoke primary ${stamp}`,
        description: "Created by the JET live smoke workflow.",
      },
    });
    created.push(first);

    const second = await api.createTask({
      workspaceSlug,
      projectKey,
      body: {
        title: `JET agent smoke linked ${stamp}`,
        description: "Temporary linked task for the JET live smoke workflow.",
      },
    });
    created.push(second);

    await api.createTaskComment({
      workspaceSlug,
      projectKey,
      taskNumber: first.number,
      body: "Agent smoke workflow can create comments.",
    });
    await api.createTaskReference({
      workspaceSlug,
      projectKey,
      taskNumber: first.number,
      title: "JET smoke workflow",
      url: "https://justeasytasks.com/docs/guides/agent-cli-golden-path/",
    });
    await api.createTaskLink({
      workspaceSlug,
      projectKey,
      taskNumber: first.number,
      targetTask: {
        project_key: second.project_key ?? projectKey,
        task_number: second.number,
      },
      relationshipType: "relates_to",
    });
    await api.resolveTask({
      workspaceSlug,
      target: `${first.project_key ?? projectKey}-${first.number}`,
      projectKey,
    });
    await api.searchWorkspace({
      workspaceSlug,
      projectKey,
      q: "JET agent smoke",
      type: "tasks",
    });

    const doneStatus = await findDoneStatus(api, workspaceSlug, projectKey);
    if (doneStatus) {
      await api.updateTask({
        workspaceSlug,
        projectKey,
        taskNumber: first.number,
        body: { status_key: doneStatus.key },
      });
    }
  } catch (error) {
    workflowError = error;
  }

  const cleanupErrors: unknown[] = [];
  for (const task of [...created].reverse()) {
    try {
      await api.deleteTask({
        workspaceSlug,
        projectKey: task.project_key ?? projectKey,
        taskNumber: task.number,
      });
    } catch (error) {
      cleanupErrors.push(error);
    }
  }
  if (workflowError !== undefined) {
    throw workflowError;
  }
  if (cleanupErrors.length > 0) {
    throw cleanupErrors[0];
  }
}

async function findDoneStatus(
  api: Pick<JetApi, "listProjectStatuses">,
  workspaceSlug: string,
  projectKey: string,
): Promise<TaskStatus | undefined> {
  const statuses = await api.listProjectStatuses({ workspaceSlug, projectKey });
  return statuses.find((status) => status.category === "done");
}

async function main(): Promise<void> {
  const config = buildSmokeConfig(process.env);

  if (!config.apiUrl || !config.apiKey) {
    console.log("Skipping live API smoke test: set JET_SMOKE_API_URL and JET_SMOKE_API_KEY.");
    return;
  }

  const result = await runSmokeWorkflow(
    new JetApi({ apiUrl: config.apiUrl, apiKey: config.apiKey }),
    config,
  );
  const suffix = result.writeWorkflow ? " Write workflow passed." : "";
  console.log(
    `Live API smoke test passed (${result.visibleWorkspaces} workspace(s) visible).${suffix}`,
  );
}

if (import.meta.main) {
  await main();
}
