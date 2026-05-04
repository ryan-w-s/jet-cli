import { Command } from "commander";

import { JetApi } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printComments } from "../output/human.js";
import { printJson } from "../output/json.js";
import { resolveTaskTarget } from "../resolution/task-target.js";
import { requireApiConfig } from "./shared.js";

export function createCommentCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("comment").description("Work with task comments");

  command
    .command("list")
    .description("List comments for a task")
    .argument("<target>")
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
    .argument("<target>")
    .argument("<body>")
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

  return command;
}
