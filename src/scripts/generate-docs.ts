import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { Command } from "commander";

import { createProgram } from "../cli.js";

const root = resolve(import.meta.dir, "../../..");
const outputDir = resolve(root, "docs/src/content/docs/cli");

type OptionLike = {
  flags: string;
  description?: string;
  defaultValue?: unknown;
};

type ArgumentLike = {
  name(): string;
  description?: string;
  required?: boolean;
  variadic?: boolean;
  defaultValue?: unknown;
};

await generateCliDocs();

async function generateCliDocs(): Promise<void> {
  const program = createProgram();
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  await writeFile(join(outputDir, "index.md"), renderIndex(program));
  for (const command of program.commands) {
    await writeFile(join(outputDir, `${command.name()}.md`), renderCommandPage(command));
  }

  console.log(`Generated CLI docs in ${outputDir}`);
}

function renderIndex(program: Command): string {
  return [
    "---",
    "title: CLI Reference",
    "description: Generated command reference for the JET CLI.",
    "---",
    "",
    generatedNotice(),
    "",
    "The JET CLI mirrors the API while keeping common task workflows short for humans and predictable for agents.",
    "",
    "## Global Options",
    "",
    renderOptions(program.options),
    "",
    "## Commands",
    "",
    ...program.commands.map((command) => {
      const description = command.description() || "No description provided.";
      return `- [\`jet ${command.name()}\`](/cli/${command.name()}/) - ${description}`;
    }),
    "",
  ].join("\n");
}

function renderCommandPage(command: Command): string {
  const options = command.options.length > 0
    ? [
        "## Options",
        "",
        renderOptions(command.options),
        "",
      ]
    : [];

  return [
    "---",
    `title: jet ${command.name()}`,
    `description: ${escapeFrontmatter(command.description() || `JET ${command.name()} commands.`)}`,
    "---",
    "",
    generatedNotice(),
    "",
    command.description() || "No description provided.",
    "",
    "## Usage",
    "",
    "```sh",
    `jet ${command.name()} [command] [options]`,
    "```",
    "",
    ...options,
    "## Subcommands",
    "",
    renderSubcommands(command, [`jet ${command.name()}`]),
    "",
  ].join("\n");
}

function renderSubcommands(command: Command, parents: string[]): string {
  if (command.commands.length === 0) {
    return "This command has no subcommands.";
  }

  return command.commands
    .map((subcommand) => renderSubcommand(parents, subcommand))
    .join("\n\n");
}

function renderSubcommand(parents: string[], command: Command): string {
  const args = getArguments(command);
  const usageParts = [
    ...parents,
    command.name(),
    ...args.map(formatArgument),
    command.options.length > 0 ? "[options]" : undefined,
  ].filter(Boolean);

  const sections = [
    `### \`${usageParts.join(" ")}\``,
    command.description() || "No description provided.",
  ];

  if (args.length > 0) {
    sections.push(["Arguments:", renderArguments(args)].join("\n"));
  }

  if (command.options.length > 0) {
    sections.push(["Options:", renderOptions(command.options)].join("\n"));
  }

  if (command.commands.length > 0) {
    sections.push(renderSubcommands(command, [...parents, command.name()]));
  }

  return sections.join("\n\n");
}

function renderArguments(args: ArgumentLike[]): string {
  return args
    .map((arg) => {
      const description = arg.description ? ` - ${arg.description}` : "";
      const defaultValue =
        arg.defaultValue === undefined ? "" : ` Default: \`${String(arg.defaultValue)}\`.`;
      return `- \`${formatArgument(arg)}\`${description}${defaultValue}`;
    })
    .join("\n");
}

function renderOptions(options: readonly OptionLike[]): string {
  if (options.length === 0) {
    return "This command has no options.";
  }

  return options
    .map((option) => {
      const description = option.description ? ` - ${option.description}` : "";
      const defaultValue =
        option.defaultValue === undefined ? "" : ` Default: \`${String(option.defaultValue)}\`.`;
      return `- \`${option.flags}\`${description}${defaultValue}`;
    })
    .join("\n");
}

function getArguments(command: Command): ArgumentLike[] {
  return ((command as unknown as { registeredArguments?: ArgumentLike[] }).registeredArguments ??
    []) as ArgumentLike[];
}

function formatArgument(arg: ArgumentLike): string {
  const name = `${arg.name()}${arg.variadic ? "..." : ""}`;
  return arg.required ? `<${name}>` : `[${name}]`;
}

function generatedNotice(): string {
  return "<!-- This file is generated from jet-cli Commander metadata. Do not edit by hand. -->";
}

function escapeFrontmatter(value: string): string {
  return JSON.stringify(value);
}
