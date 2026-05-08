#!/usr/bin/env node
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
import { createTaskCommand } from "./commands/task.js";
import { createWorkspaceCommand } from "./commands/workspace.js";
import { loadRuntimeContext, type GlobalOptions } from "./config/load.js";
import { printAmbiguousTask } from "./output/human.js";
import { printJson } from "./output/json.js";
import {
  AmbiguousTaskError,
  CliUsageError,
} from "./resolution/task-target.js";

const program = new Command();

program
  .name("jet")
  .description("Command line interface for Just Easy Tasks")
  .version("0.1.0")
  .option("--api-url <url>", "JET API base URL")
  .option("--api-key <key>", "JET API key")
  .option("-w, --workspace <slug>", "workspace slug")
  .option("-p, --project <key>", "project key")
  .option("--json", "print machine-readable JSON")
  .option("--no-cache", "disable client-side cache reads and writes")
  .option("--refresh", "bypass cached reads and update cache entries")
  .option("--no-input", "disable interactive prompts");

const getContext = () => loadRuntimeContext(rootOptions());

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

program.parseAsync().catch(async (error: unknown) => {
  await handleError(error);
  process.exitCode = 1;
});

function rootOptions(): GlobalOptions {
  const options = program.opts<GlobalOptions & { input?: boolean }>();
  return {
    ...options,
    noInput: options.input === false ? true : options.noInput,
  };
}

async function handleError(error: unknown): Promise<void> {
  const context = await loadRuntimeContext(rootOptions()).catch(() => undefined);
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
    writeError("api_error", error.message, json, {
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
