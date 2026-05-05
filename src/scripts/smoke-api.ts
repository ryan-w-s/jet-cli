import { JetApi } from "../api/client.js";

const apiUrl = process.env["JET_SMOKE_API_URL"] ?? process.env["JET_API_URL"];
const apiKey = process.env["JET_SMOKE_API_KEY"] ?? process.env["JET_API_KEY"];
const workspace = process.env["JET_SMOKE_WORKSPACE"] ?? process.env["JET_WORKSPACE"];
const project = process.env["JET_SMOKE_PROJECT"] ?? process.env["JET_PROJECT"];

if (!apiUrl || !apiKey) {
  console.log("Skipping live API smoke test: set JET_SMOKE_API_URL and JET_SMOKE_API_KEY.");
  process.exit(0);
}

const api = new JetApi({ apiUrl, apiKey });
await api.getCurrentActor();
const workspaces = await api.listWorkspaces();

if (workspace) {
  await api.getWorkspace(workspace);
}

if (workspace && project) {
  await api.getProject({ workspaceSlug: workspace, projectKey: project });
  await Promise.all([
    api.listProjectTasks({ workspaceSlug: workspace, projectKey: project }),
    api.listProjectStatuses({ workspaceSlug: workspace, projectKey: project }),
    api.listProjectLabels({ workspaceSlug: workspace, projectKey: project }),
    api.listBoards({ workspaceSlug: workspace, projectKey: project }),
  ]);
}

console.log(`Live API smoke test passed (${workspaces.length} workspace(s) visible).`);
