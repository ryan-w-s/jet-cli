import { describe, expect, test } from "bun:test";

import type { JetApi } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { runDoctorChecks } from "./doctor.js";

describe("runDoctorChecks", () => {
  test("reports missing API key before attempting API checks", async () => {
    const report = await runDoctorChecks(makeContext({ apiKey: undefined }), {
      apiFactory: () => {
        throw new Error("api should not be constructed without a key");
      },
    });

    expect(report.ok).toBe(false);
    expect(report.checks.map((check) => [check.name, check.status])).toEqual([
      ["api_url", "ok"],
      ["api_key", "error"],
      ["auth", "skipped"],
      ["workspace", "skipped"],
      ["project", "skipped"],
      ["agent_mode", "ok"],
    ]);
    expect(report.checks[1]?.recovery).toContain("jet config set api-key");
  });

  test("probes auth, workspace, and project when configured", async () => {
    const calls: string[] = [];
    const api = {
      getCurrentActor: async () => {
        calls.push("me");
        return {
          auth_type: "api_key",
          user: {
            id: "user-id",
            email: "agent@example.com",
            name: null,
            clerk_user_id: null,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          },
          plan_tier: "free",
          billing: null,
        };
      },
      getWorkspace: async (workspaceSlug: string) => {
        calls.push(`workspace:${workspaceSlug}`);
        return {
          id: "workspace-id",
          slug: workspaceSlug,
          name: "Acme",
          owner_user_id: "user-id",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        };
      },
      getProject: async (args: { workspaceSlug: string; projectKey: string }) => {
        calls.push(`project:${args.workspaceSlug}/${args.projectKey}`);
        return {
          id: "project-id",
          workspace_id: "workspace-id",
          key: args.projectKey,
          name: "JET",
          description: null,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        };
      },
    } as unknown as JetApi;

    const report = await runDoctorChecks(makeContext(), {
      apiFactory: () => api,
    });

    expect(report.ok).toBe(true);
    expect(calls).toEqual(["me", "workspace:acme", "project:acme/JET"]);
    expect(report.checks.map((check) => [check.name, check.status])).toEqual([
      ["api_url", "ok"],
      ["api_key", "ok"],
      ["auth", "ok"],
      ["workspace", "ok"],
      ["project", "ok"],
      ["agent_mode", "ok"],
    ]);
  });

  test("fails the report when workspace is set without a project", async () => {
    const api = {
      getCurrentActor: async () => ({
        auth_type: "api_key",
        user: {
          id: "user-id",
          email: "agent@example.com",
          name: null,
          clerk_user_id: null,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
        plan_tier: "free",
        billing: null,
      }),
      getWorkspace: async () => ({
        id: "workspace-id",
        slug: "acme",
        name: "Acme",
        owner_user_id: "user-id",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      }),
    } as unknown as JetApi;

    const report = await runDoctorChecks(
      makeContext({ project: undefined, output: "human" }),
      { apiFactory: () => api },
    );

    const project = report.checks.find((check) => check.name === "project");
    const agentMode = report.checks.find((check) => check.name === "agent_mode");
    expect(report.ok).toBe(false);
    expect(project?.status).toBe("warning");
    expect(project?.recovery).toContain("jet use project");
    expect(agentMode?.status).toBe("warning");
    expect(agentMode?.recovery).toContain("JET_OUTPUT=json");
  });
});

function makeContext(
  overrides: Partial<RuntimeContext["config"]> = {},
): RuntimeContext {
  return {
    config: {
      apiUrl: "https://justeasytasks.com",
      apiKey: "jet_test",
      workspace: "acme",
      project: "JET",
      output: "json",
      cache: "on",
      ...overrides,
    },
    noInput: true,
  };
}
