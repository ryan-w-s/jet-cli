#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { Command } from "commander";

import { JetApiError } from "./api/client.js";
import { createAuthCommand } from "./commands/auth.js";
import { createCacheCommand } from "./commands/cache.js";
import {
  createConfigCommand,
  createContextCommand,
  createUseCommand,
} from "./commands/config.js";
import { createCommentCommand } from "./commands/comment.js";
import {
  createLabelCommand,
  createPriorityCommand,
  createStatusCommand,
  createTypeCommand,
} from "./commands/metadata.js";
import { createProjectCommand } from "./commands/project.js";
import {
  createBoardCommand,
  createLinkCommand,
  createReferenceCommand,
} from "./commands/relations.js";
import { createSkillsCommand } from "./commands/skills.js";
import { createTaskCommand } from "./commands/task.js";
import { createWorkspaceCommand } from "./commands/workspace.js";
import { loadRuntimeContext, type GlobalOptions } from "./config/load.js";
import { printAmbiguousTask } from "./output/human.js";
import { printJson } from "./output/json.js";
import {
  AmbiguousTaskError,
  CliUsageError,
} from "./resolution/task-target.js";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("jet")
    .description("Manage Just Easy Tasks workspaces, projects, tasks, and metadata")
    .version(readPackageVersion())
    .option("--api-url <url>", "API base URL (defaults to https://justeasytasks.com)")
    .option("--api-key <key>", "API key for X-API-Key authentication")
    .option("-w, --workspace <slug>", "workspace slug to use for this command")
    .option("-p, --project <key>", "project key to use for this command")
    .option("--json", "print JSON for scripts and agents")
    .option("--no-cache", "skip cache reads and writes")
    .option("--refresh", "fetch fresh data and update cache entries")
    .option("--no-input", "fail instead of prompting for confirmation");

  const getContext = () => loadRuntimeContext(rootOptions(program));

  program.addCommand(createConfigCommand());
  program.addCommand(createUseCommand());
  program.addCommand(createContextCommand(getContext));
  program.addCommand(createCacheCommand(getContext));
  program.addCommand(createAuthCommand(getContext));
  program.addCommand(createWorkspaceCommand(getContext));
  program.addCommand(createProjectCommand(getContext));
  program.addCommand(createTypeCommand(getContext));
  program.addCommand(createPriorityCommand(getContext));
  program.addCommand(createStatusCommand(getContext));
  program.addCommand(createLabelCommand(getContext));
  program.addCommand(createTaskCommand(getContext));
  program.addCommand(createCommentCommand(getContext));
  program.addCommand(createLinkCommand(getContext));
  program.addCommand(createReferenceCommand(getContext));
  program.addCommand(createBoardCommand(getContext));
  program.addCommand(createSkillsCommand());

  return program;
}

function readPackageVersion(): string {
  try {
    const packageJsonUrl = new URL("../package.json", import.meta.url);
    const packageJson = JSON.parse(readFileSync(packageJsonUrl, "utf8")) as {
      version?: unknown;
    };
    if (typeof packageJson.version === "string" && packageJson.version) {
      return packageJson.version;
    }
  } catch {
    // Keep the CLI startable in unusual dev or packaged layouts.
  }
  return "0.0.0";
}

if (import.meta.main) {
  const program = createProgram();
  program.parseAsync().catch(async (error: unknown) => {
    await handleError(error, program);
    process.exitCode = 1;
  });
}

function rootOptions(program: Command): GlobalOptions {
  const options = program.opts<GlobalOptions & { input?: boolean }>();
  return {
    ...options,
    noInput: options.input === false ? true : options.noInput,
  };
}

async function handleError(error: unknown, program: Command): Promise<void> {
  const context = await loadRuntimeContext(rootOptions(program)).catch(() => undefined);
  const json = context?.config.output === "json";

  if (error instanceof AmbiguousTaskError) {
    if (json) {
      printJson({
        error: "ambiguous_task",
        query: error.target,
        candidates: error.candidates,
      });
      return;
    }
    printAmbiguousTask(error.target, error.candidates);
    return;
  }

  if (error instanceof CliUsageError) {
    writeError("usage_error", error.message, json);
    return;
  }

  if (error instanceof JetApiError) {
    writeError("api_error", formatApiError(error), json, {
      status: error.status,
      detail: error.detail,
    });
    return;
  }

  if (error instanceof Error) {
    writeError("unexpected_error", error.message, json);
    return;
  }

  writeError("unexpected_error", String(error), json);
}

function writeError(
  code: string,
  message: string,
  json: boolean,
  extra: Record<string, unknown> = {},
): void {
  if (json) {
    printJson({ error: code, message, ...extra });
    return;
  }
  console.error(message);
}

function formatApiError(error: JetApiError): string {
  return `JET API request failed with HTTP ${error.status}: ${error.message}`;
}
