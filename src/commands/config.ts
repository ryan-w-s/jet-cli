import { Command } from "commander";

import {
  type JetConfig,
  type RuntimeContext,
  readUserConfig,
  userConfigFile,
  writeUserConfig,
} from "../config/load.js";
import { printJson } from "../output/json.js";

const CONFIG_KEYS = new Set<keyof JetConfig>([
  "apiUrl",
  "apiKey",
  "workspace",
  "project",
  "output",
]);

export function createConfigCommand(): Command {
  const command = new Command("config").description("Manage JET CLI configuration");

  command
    .command("set")
    .description("Set a user-level config value")
    .argument("<key>", "api-url, api-key, workspace, project, or output")
    .argument("<value>", "value to store")
    .action(async (key: string, value: string) => {
      const normalizedKey = normalizeConfigKey(key);
      const config = await readUserConfig();
      config[normalizedKey] = value as never;
      await writeUserConfig(config);
      console.log(`Saved ${normalizedKey} in ${userConfigFile()}`);
    });

  command
    .command("get")
    .description("Show user-level config")
    .argument("[key]", "optional config key")
    .option("--json", "print JSON")
    .action(async (key: string | undefined, options: { json?: boolean }) => {
      const config = await readUserConfig();
      if (key) {
        const normalizedKey = normalizeConfigKey(key);
        const value = config[normalizedKey];
        if (options.json) {
          printJson({ [normalizedKey]: value ?? null });
        } else {
          console.log(value ?? "");
        }
        return;
      }
      if (options.json) {
        printJson(config);
        return;
      }
      for (const [name, value] of Object.entries(config)) {
        console.log(`${name}: ${value}`);
      }
    });

  return command;
}

export function createUseCommand(): Command {
  const command = new Command("use").description("Set default workspace or project");

  command
    .command("workspace")
    .description("Set the default workspace")
    .argument("<slug>")
    .action(async (slug: string) => {
      const config = await readUserConfig();
      await writeUserConfig({ ...config, workspace: slug });
      console.log(`Default workspace set to ${slug}`);
    });

  command
    .command("project")
    .description("Set the default project")
    .argument("<key>")
    .action(async (key: string) => {
      const config = await readUserConfig();
      await writeUserConfig({ ...config, project: key });
      console.log(`Default project set to ${key}`);
    });

  return command;
}

export function createContextCommand(getContext: () => Promise<RuntimeContext>): Command {
  return new Command("context")
    .description("Show the resolved CLI context")
    .action(async () => {
      const { config } = await getContext();
      printJson({
        apiUrl: config.apiUrl ?? null,
        hasApiKey: Boolean(config.apiKey),
        workspace: config.workspace ?? null,
        project: config.project ?? null,
        output: config.output ?? "human",
      });
    });
}

function normalizeConfigKey(key: string): keyof JetConfig {
  const normalized = key.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
  if (!CONFIG_KEYS.has(normalized as keyof JetConfig)) {
    throw new Error(`Unknown config key "${key}".`);
  }
  return normalized as keyof JetConfig;
}
