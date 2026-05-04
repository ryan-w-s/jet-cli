import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, parse, resolve } from "node:path";

export type JetConfig = {
  apiUrl?: string;
  apiKey?: string;
  workspace?: string;
  project?: string;
  output?: "human" | "json";
};

export type GlobalOptions = {
  apiUrl?: string;
  apiKey?: string;
  workspace?: string;
  project?: string;
  json?: boolean;
  noInput?: boolean;
};

export type RuntimeContext = {
  config: JetConfig;
  noInput: boolean;
};

const USER_CONFIG_PATH = userConfigPath();

export async function loadRuntimeContext(
  options: GlobalOptions,
): Promise<RuntimeContext> {
  const [userConfig, localConfig] = await Promise.all([
    readConfig(USER_CONFIG_PATH),
    readLocalConfig(),
  ]);
  const envConfig = readEnvConfig();
  const cliConfig: JetConfig = {
    apiUrl: options.apiUrl,
    apiKey: options.apiKey,
    workspace: options.workspace,
    project: options.project,
    output: options.json ? "json" : undefined,
  };

  return {
    config: mergeConfigSources(userConfig, localConfig, envConfig, cliConfig),
    noInput: options.noInput ?? false,
  };
}

export async function readUserConfig(): Promise<JetConfig> {
  return readConfig(USER_CONFIG_PATH);
}

export async function writeUserConfig(config: JetConfig): Promise<void> {
  await mkdir(dirname(USER_CONFIG_PATH), { recursive: true });
  await writeFile(USER_CONFIG_PATH, `${JSON.stringify(compactConfig(config), null, 2)}\n`);
}

export function userConfigFile(): string {
  return USER_CONFIG_PATH;
}

function readEnvConfig(): JetConfig {
  return compactConfig({
    apiUrl: process.env["JET_API_URL"],
    apiKey: process.env["JET_API_KEY"],
    workspace: process.env["JET_WORKSPACE"],
    project: process.env["JET_PROJECT"],
    output: parseOutput(process.env["JET_OUTPUT"]),
  });
}

async function readLocalConfig(): Promise<JetConfig> {
  const configPath = findUp(".jet/config.json", process.cwd());
  return configPath === null ? {} : readConfig(configPath);
}

async function readConfig(path: string): Promise<JetConfig> {
  if (!existsSync(path)) {
    return {};
  }
  const raw = await readFile(path, "utf8");
  return compactConfig(JSON.parse(raw) as JetConfig);
}

function userConfigPath(): string {
  if (process.platform === "win32" && process.env["APPDATA"]) {
    return join(process.env["APPDATA"], "jet", "config.json");
  }
  const configHome = process.env["XDG_CONFIG_HOME"] ?? join(process.env["HOME"] ?? "", ".config");
  return join(configHome, "jet", "config.json");
}

export function findUp(relativePath: string, start: string): string | null {
  let current = resolve(start);
  const root = parse(current).root;
  while (true) {
    const candidate = join(current, relativePath);
    if (existsSync(candidate)) {
      return candidate;
    }
    if (current === root) {
      return null;
    }
    current = dirname(current);
  }
}

export function compactConfig(config: JetConfig): JetConfig {
  return Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== undefined && value !== ""),
  ) as JetConfig;
}

export function parseOutput(value: string | undefined): JetConfig["output"] | undefined {
  if (value === "json" || value === "human") {
    return value;
  }
  return undefined;
}

export function mergeConfigSources(
  userConfig: JetConfig,
  localConfig: JetConfig,
  envConfig: JetConfig,
  cliConfig: JetConfig,
): JetConfig {
  return compactConfig({
    ...userConfig,
    ...localConfig,
    ...envConfig,
    ...cliConfig,
  });
}
