import { Command } from "commander";

import { JetApi } from "../api/client.js";
import type { RuntimeContext } from "../config/load.js";
import { printRecordList, printRecordValue, printWorkspaces } from "../output/human.js";
import { printJson } from "../output/json.js";
import { requireWorkspace } from "../resolution/task-target.js";
import {
  compactObject,
  confirmDestructiveAction,
  printDeleted,
  requireApiConfig,
  type DestructiveOptions,
} from "./shared.js";

export function createWorkspaceCommand(getContext: () => Promise<RuntimeContext>): Command {
  const command = new Command("workspace").description("Work with workspaces");

  command
    .command("list")
    .description("List workspaces visible to the API key")
    .action(async () => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const workspaces = await api.listWorkspaces();
      if (config.output === "json") {
        printJson(workspaces);
        return;
      }
      printWorkspaces(workspaces);
    });

  command
    .command("get")
    .description("Get a workspace")
    .argument("[slug]", "workspace slug")
    .action(async (slug: string | undefined) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const workspace = await api.getWorkspace(slug ?? requireWorkspace(config.workspace));
      printValue(config.output, workspace, "No workspace found.");
    });

  command
    .command("create")
    .description("Create a workspace")
    .argument("<slug>")
    .argument("<name>")
    .option("--description <text>")
    .action(async (slug: string, name: string, options: { description?: string }) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const workspace = await api.createWorkspace({
        slug,
        name,
        description: options.description,
      });
      printValue(config.output, workspace, "No workspace found.");
    });

  command
    .command("update")
    .description("Update a workspace")
    .argument("[slug]", "workspace slug")
    .option("--name <name>")
    .option("--description <text>")
    .action(async (slug: string | undefined, options: WorkspaceUpdateOptions) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const workspace = await api.updateWorkspace({
        workspaceSlug: slug ?? requireWorkspace(config.workspace),
        body: compactObject({
          name: options.name,
          description: options.description,
        }),
      });
      printValue(config.output, workspace, "No workspace found.");
    });

  command
    .command("delete")
    .description("Delete a workspace")
    .argument("[slug]", "workspace slug")
    .option("--force", "delete without prompting")
    .action(async (slug: string | undefined, options: DestructiveOptions) => {
      const context = await getContext();
      const { config } = context;
      const api = new JetApi(requireApiConfig(config));
      const workspaceSlug = slug ?? requireWorkspace(config.workspace);
      await confirmDestructiveAction(context, options, `Delete workspace ${workspaceSlug}?`);
      await api.deleteWorkspace(workspaceSlug);
      printDeleted(config, "workspace", workspaceSlug);
    });

  const members = new Command("member").description("Manage workspace members");
  members
    .command("list")
    .description("List workspace members")
    .argument("[workspace]", "workspace slug")
    .action(async (workspace: string | undefined) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const records = await api.listWorkspaceMembers(
        workspace ?? requireWorkspace(config.workspace),
      );
      printList(config.output, records, "No workspace members found.");
    });

  members
    .command("remove")
    .description("Remove a workspace member")
    .argument("<user-id>")
    .argument("[workspace]", "workspace slug")
    .option("--force", "remove without prompting")
    .action(
      async (
        userId: string,
        workspace: string | undefined,
        options: DestructiveOptions,
      ) => {
        const context = await getContext();
        const { config } = context;
        const api = new JetApi(requireApiConfig(config));
        const workspaceSlug = workspace ?? requireWorkspace(config.workspace);
        await confirmDestructiveAction(
          context,
          options,
          `Remove member ${userId} from workspace ${workspaceSlug}?`,
        );
        await api.deleteWorkspaceMember({ workspaceSlug, userId });
        printDeleted(config, "workspace-member", userId);
      },
    );
  command.addCommand(members);

  const invites = new Command("invite").description("Manage workspace invites");
  invites
    .command("list")
    .description("List active workspace invites")
    .argument("[workspace]", "workspace slug")
    .action(async (workspace: string | undefined) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const records = await api.listWorkspaceInvites(
        workspace ?? requireWorkspace(config.workspace),
      );
      printList(config.output, records, "No workspace invites found.");
    });

  invites
    .command("get")
    .description("Get a workspace invite")
    .argument("<invite-id>")
    .action(async (inviteId: string) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const invite = await api.getWorkspaceInvite(inviteId);
      printValue(config.output, invite, "No workspace invite found.");
    });

  invites
    .command("create")
    .description("Create a workspace invite")
    .argument("<email>")
    .argument("[workspace]", "workspace slug")
    .option("--role <role>", "workspace role", "member")
    .action(
      async (
        email: string,
        workspace: string | undefined,
        options: { role: "owner" | "member" },
      ) => {
        const { config } = await getContext();
        const api = new JetApi(requireApiConfig(config));
        const invite = await api.createWorkspaceInvite({
          workspaceSlug: workspace ?? requireWorkspace(config.workspace),
          body: { email, role: options.role },
        });
        printValue(config.output, invite, "No workspace invite found.");
      },
    );

  invites
    .command("delete")
    .description("Delete a workspace invite")
    .argument("<invite-id>")
    .argument("[workspace]", "workspace slug")
    .option("--force", "delete without prompting")
    .action(
      async (
        inviteId: string,
        workspace: string | undefined,
        options: DestructiveOptions,
      ) => {
        const context = await getContext();
        const { config } = context;
        const api = new JetApi(requireApiConfig(config));
        const workspaceSlug = workspace ?? requireWorkspace(config.workspace);
        await confirmDestructiveAction(
          context,
          options,
          `Delete workspace invite ${inviteId}?`,
        );
        await api.deleteWorkspaceInvite({ workspaceSlug, inviteId });
        printDeleted(config, "workspace-invite", inviteId);
      },
    );

  invites
    .command("accept")
    .description("Accept a workspace invite")
    .argument("<invite-id>")
    .argument("[workspace]", "workspace slug")
    .action(async (inviteId: string, workspace: string | undefined) => {
      const { config } = await getContext();
      const api = new JetApi(requireApiConfig(config));
      const accepted = await api.acceptWorkspaceInvite({
        workspaceSlug: workspace ?? requireWorkspace(config.workspace),
        inviteId,
      });
      printValue(config.output, accepted, "No workspace found.");
    });
  command.addCommand(invites);

  return command;
}

type WorkspaceUpdateOptions = {
  name?: string;
  description?: string;
};

function printList(output: string | undefined, records: unknown[], emptyMessage: string): void {
  printRecordList(output, records, emptyMessage);
}

function printValue(output: string | undefined, record: unknown, emptyMessage: string): void {
  printRecordValue(output, record, emptyMessage);
}
