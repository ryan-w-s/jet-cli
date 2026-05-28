import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

type SkillsInstallOptions = {
  agent?: string[];
  global?: boolean;
  copy?: boolean;
  yes?: boolean;
  all?: boolean;
};

const bundledSkillName = "just-easy-tasks";

export function createSkillsCommand(): Command {
  const command = new Command("skills").description("Install bundled JET agent skills");

  command
    .command("install")
    .description("Install the bundled JET skill through npx skills")
    .option("-a, --agent <agent...>", "target agent(s), such as codex or claude-code")
    .option("-g, --global", "install to the user skills directory")
    .option("--copy", "copy files instead of symlinking")
    .option("-y, --yes", "skip npx skills confirmation prompts")
    .option("--all", "install to all detected agents")
    .action(async (options: SkillsInstallOptions) => {
      const skillsDir = await resolveBundledSkillsDir();
      const args = buildSkillsAddArgs(skillsDir, options);
      const commandName = process.platform === "win32" ? "npx.cmd" : "npx";
      const fallback = formatCommand(commandName, args);

      try {
        await run(commandName, args);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Could not run ${fallback}`);
        console.error(message);
        console.error(`Run this manually instead:\n${fallback}`);
        process.exitCode = 1;
      }
    });

  return command;
}

export function buildSkillsAddArgs(
  skillsDir: string,
  options: SkillsInstallOptions = {},
): string[] {
  const args = ["skills", "add", skillsDir, "--skill", bundledSkillName];

  for (const agent of options.agent ?? []) {
    args.push("--agent", agent);
  }
  if (options.global) {
    args.push("--global");
  }
  if (options.copy) {
    args.push("--copy");
  }
  if (options.yes) {
    args.push("--yes");
  }
  if (options.all) {
    args.push("--all");
  }

  return args;
}

async function resolveBundledSkillsDir(): Promise<string> {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    new URL("../skills", import.meta.url),
    new URL("../../skills", import.meta.url),
  ].map((url) => fileURLToPath(url));

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next layout: packaged dist first, source tree second.
    }
  }

  throw new Error(`Bundled skills directory not found near ${here}.`);
}

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(signal ? `${command} exited with signal ${signal}` : `${command} exited with code ${code}`));
    });
  });
}

function formatCommand(command: string, args: string[]): string {
  return [command, ...args].map(quoteArg).join(" ");
}

function quoteArg(value: string): string {
  if (/^[A-Za-z0-9_./:@=-]+$/.test(value)) {
    return value;
  }
  return JSON.stringify(value);
}
