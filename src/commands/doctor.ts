import { Command } from "commander";

import { JetApi, JetApiError, type JetApiOptions } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printJson } from "../output/json.js";
import { requireApiConfig } from "./shared.js";

export type DoctorCheckStatus = "ok" | "warning" | "error" | "skipped";

export type DoctorCheck = {
  name: string;
  status: DoctorCheckStatus;
  message: string;
  recovery?: string;
};

export type DoctorReport = {
  ok: boolean;
  checks: DoctorCheck[];
};

export type DoctorOptions = {
  apiFactory?: (options: JetApiOptions) => Pick<
    JetApi,
    "getCurrentActor" | "getWorkspace" | "getProject"
  >;
};

export function createDoctorCommand(
  getContext: () => Promise<RuntimeContext>,
): Command {
  return new Command("doctor")
    .description("Check API auth, context, and agent-friendly output settings")
    .action(async () => {
      const context = await getContext();
      const report = await runDoctorChecks(context);
      if (context.config.output === "json") {
        printJson(report);
      } else {
        printDoctorReport(report);
      }
      if (!report.ok) {
        process.exitCode = 1;
      }
    });
}

export async function runDoctorChecks(
  context: RuntimeContext,
  options: DoctorOptions = {},
): Promise<DoctorReport> {
  const checks: DoctorCheck[] = [];
  const config = context.config;

  checks.push({
    name: "api_url",
    status: config.apiUrl ? "ok" : "error",
    message: config.apiUrl
      ? `Using API URL ${config.apiUrl}.`
      : "No API URL is configured.",
    recovery: config.apiUrl
      ? undefined
      : "Pass --api-url <url>, set JET_API_URL, or run `jet config set api-url <url>`.",
  });

  checks.push({
    name: "api_key",
    status: config.apiKey ? "ok" : "error",
    message: config.apiKey
      ? "API key is configured."
      : "No API key is configured.",
    recovery: config.apiKey
      ? undefined
      : "Create an API key in the web app, then run `jet config set api-key <key>` or set JET_API_KEY.",
  });

  if (!config.apiUrl || !config.apiKey) {
    checks.push(skipped("auth", "Skipped API auth check until api_url and api_key pass."));
    checks.push(skipped("workspace", "Skipped workspace check until API auth passes."));
    checks.push(skipped("project", "Skipped project check until API auth passes."));
    checks.push(agentModeCheck(config.output));
    return report(checks);
  }

  const apiOptions = requireApiConfig(config);
  const api = options.apiFactory?.(apiOptions) ?? new JetApi(apiOptions);

  const authOk = await pushApiCheck(
    checks,
    "auth",
    "Authenticated with the JET API.",
    "Could not authenticate with the JET API.",
    "Check that the API key is active and belongs to the configured API URL.",
    () => api.getCurrentActor(),
  );

  if (!authOk) {
    checks.push(skipped("workspace", "Skipped workspace check until API auth passes."));
    checks.push(skipped("project", "Skipped project check until API auth passes."));
    checks.push(agentModeCheck(config.output));
    return report(checks);
  }

  let workspaceOk = false;
  if (config.workspace) {
    workspaceOk = await pushApiCheck(
      checks,
      "workspace",
      `Workspace ${config.workspace} is reachable.`,
      `Workspace ${config.workspace} is not reachable.`,
      "Run `jet workspace list --json`, then `jet use workspace <slug>`.",
      () => api.getWorkspace(config.workspace as string),
    );
  } else {
    checks.push({
      name: "workspace",
      status: "warning",
      message: "No default workspace is configured.",
      recovery: "Run `jet workspace list --json`, then `jet use workspace <slug>`.",
    });
  }

  if (workspaceOk && config.workspace && config.project) {
    await pushApiCheck(
      checks,
      "project",
      `Project ${config.project} is reachable in ${config.workspace}.`,
      `Project ${config.project} is not reachable in ${config.workspace}.`,
      "Run `jet project list --json`, then `jet use project <key>`.",
      () =>
        api.getProject({
          workspaceSlug: config.workspace as string,
          projectKey: config.project as string,
        }),
    );
  } else if (!config.project) {
    checks.push({
      name: "project",
      status: "warning",
      message: "No default project is configured.",
      recovery: "Run `jet project list --json`, then `jet use project <key>`.",
    });
  } else {
    checks.push(skipped("project", "Skipped project check until workspace passes."));
  }

  checks.push(agentModeCheck(config.output));
  return report(checks);
}

async function pushApiCheck(
  checks: DoctorCheck[],
  name: string,
  okMessage: string,
  errorMessage: string,
  recovery: string,
  action: () => Promise<unknown>,
): Promise<boolean> {
  try {
    await action();
    checks.push({ name, status: "ok", message: okMessage });
    return true;
  } catch (error) {
    checks.push({
      name,
      status: "error",
      message:
        error instanceof JetApiError
          ? `${errorMessage} HTTP ${error.status}: ${error.message}`
          : errorMessage,
      recovery,
    });
    return false;
  }
}

function skipped(name: string, message: string): DoctorCheck {
  return { name, status: "skipped", message };
}

function agentModeCheck(output: RuntimeContext["config"]["output"]): DoctorCheck {
  if (output === "json") {
    return {
      name: "agent_mode",
      status: "ok",
      message: "JSON output is enabled for script and agent parsing.",
    };
  }
  return {
    name: "agent_mode",
    status: "warning",
    message: "Human output is active.",
    recovery: "Agents should pass --json, run `jet config set output json`, or set JET_OUTPUT=json.",
  };
}

function report(checks: DoctorCheck[]): DoctorReport {
  return {
    ok: checks.every((check) => check.status === "ok" || check.status === "skipped"),
    checks,
  };
}

function printDoctorReport(value: DoctorReport): void {
  for (const check of value.checks) {
    const suffix = check.recovery ? ` ${check.recovery}` : "";
    console.log(`${check.status.toUpperCase().padEnd(7)} ${check.name}: ${check.message}${suffix}`);
  }
}
