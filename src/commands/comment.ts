import { Command } from "commander";

import { JetApi } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printComments, printRecord } from "../output/human.js";
import { printJson } from "../output/json.js";
import { resolveTaskTarget } from "../resolution/task-target.js";
import {
  confirmDestructiveAction,
  printDeleted,
  requireApiConfig,
  type DestructiveOptions,
} from "./shared.js";

export function createCommentCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("comment").description("List, add, update, and delete task comments");

  command
    .command("list")
    .description("List comments for a task")
    .argument("<target>", "task ref, number, or title fragment")
    .action(async (target: string) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const resolved = await resolveTaskTarget({
        api,
        target,
        workspace: config.workspace,
        project: config.project,
      });
      const comments = await api.listTaskComments(resolved);
      if (config.output === "json") {
        printJson(comments);
        return;
      }
      printComments(comments);
    });

  command
    .command("add")
    .description("Add a comment to a task")
    .argument("<target>", "task ref, number, or title fragment")
    .argument("<body>", "comment body")
    .action(async (target: string, body: string) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const resolved = await resolveTaskTarget({
        api,
        target,
        workspace: config.workspace,
        project: config.project,
      });
      const comment = await api.createTaskComment({ ...resolved, body });
      if (config.output === "json") {
        printJson(comment);
        return;
      }
      console.log(comment.body);
    });

  command
    .command("update")
    .description("Update a task comment")
    .argument("<target>", "task ref, number, or title fragment")
    .argument("<comment-id>", "comment ID")
    .argument("<body>", "new comment body")
    .action(async (target: string, commentId: string, body: string) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const resolved = await resolveTaskTarget({
        api,
        target,
        workspace: config.workspace,
        project: config.project,
      });
      const comment = await api.updateTaskComment({ ...resolved, commentId, body });
      if (config.output === "json") {
        printJson(comment);
        return;
      }
      printRecord(comment as unknown as Record<string, unknown>);
    });

  command
    .command("delete")
    .description("Delete a task comment")
    .argument("<target>", "task ref, number, or title fragment")
    .argument("<comment-id>", "comment ID")
    .option("--force", "delete without prompting")
    .action(
      async (target: string, commentId: string, options: DestructiveOptions) => {
        const context = await getContext();
        const { config } = context;
        const api = new JetApi(requireApiConfig(config));
        const resolved = await resolveTaskTarget({
          api,
          target,
          workspace: config.workspace,
          project: config.project,
        });
        await confirmDestructiveAction(context, options, `Delete comment ${commentId}?`);
        await api.deleteTaskComment({ ...resolved, commentId });
        printDeleted(config, "comment", commentId);
      },
    );

  return command;
}
