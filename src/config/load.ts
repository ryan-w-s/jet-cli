import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, parse, resolve } from "node:path";

export type JetConfig = {
  apiUrl?: string;
  apiKey?: string;
  workspace?: string;
  project?: string;
  output?: "human" | "json";
  cache?: "on" | "off";
  cacheRefresh?: boolean;
};

export type GlobalOptions = {
  apiUrl?: string;
  apiKey?: string;
  workspace?: string;
  project?: string;
  json?: boolean;
  noInput?: boolean;
  dangerouslyEnableAdminCommands?: boolean;
  cache?: boolean;
  refresh?: boolean;
};

export type RuntimeContext = {
  config: JetConfig;
  noInput: boolean;
  adminCommandsEnabled: boolean;
};

export const DEFAULT_API_URL = "https://justeasytasks.com";

const PRIVATE_FILE_MODE = 0o600;
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
    cache: options.cache === false ? "off" : undefined,
    cacheRefresh: options.refresh ? true : undefined,
  };

  return {
    config: mergeConfigSources(
      { apiUrl: DEFAULT_API_URL },
      userConfig,
      localConfig,
      envConfig,
      cliConfig,
    ),
    noInput: options.noInput ?? false,
    adminCommandsEnabled: options.dangerouslyEnableAdminCommands ?? false,
  };
}

export async function readUserConfig(): Promise<JetConfig> {
  return readConfig(USER_CONFIG_PATH);
}

export async function writeUserConfig(config: JetConfig): Promise<void> {
  await mkdir(dirname(USER_CONFIG_PATH), { recursive: true });
  await writeFile(USER_CONFIG_PATH, `${JSON.stringify(compactConfig(config), null, 2)}\n`, {
    mode: PRIVATE_FILE_MODE,
  });
  await chmodPrivate(USER_CONFIG_PATH);
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
    cache: parseCache(process.env["JET_CACHE"]),
  });
}

async function readLocalConfig(): Promise<JetConfig> {
  const configPath = findUp(".jet/config.json", process.cwd());
  return configPath === null ? {} : sanitizeLocalConfig(await readConfig(configPath));
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

export function parseCache(value: string | undefined): JetConfig["cache"] | undefined {
  if (value === "on" || value === "off") {
    return value;
  }
  return undefined;
}

export function mergeConfigSources(...sources: JetConfig[]): JetConfig {
  return compactConfig(Object.assign({}, ...sources));
}

export function sanitizeLocalConfig(config: JetConfig): JetConfig {
  if (config.apiUrl === undefined) {
    return config;
  }

  if (isTrustedLocalApiUrl(config.apiUrl) && config.apiKey !== undefined) {
    return config;
  }

  const safeConfig = { ...config };
  delete safeConfig.apiUrl;
  return safeConfig;
}

export function isTrustedLocalApiUrl(apiUrl: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(apiUrl).hostname.toLowerCase();
  } catch {
    return false;
  }

  if (hostname === "localhost" || hostname === "::1" || hostname === "[::1]") {
    return true;
  }

  const ipv4 = parseIpv4(hostname);
  if (ipv4 === null) {
    return false;
  }

  const [first, second] = ipv4;
  return (
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function parseIpv4(hostname: string): [number, number, number, number] | null {
  const parts = hostname.split(".");
  if (parts.length !== 4) {
    return null;
  }

  const octets = parts.map((part) => {
    if (!/^\d+$/.test(part)) {
      return Number.NaN;
    }
    const value = Number(part);
    return value >= 0 && value <= 255 ? value : Number.NaN;
  });

  if (octets.some(Number.isNaN)) {
    return null;
  }

  return octets as [number, number, number, number];
}

async function chmodPrivate(path: string): Promise<void> {
  if (process.platform === "win32") {
    return;
  }
  await chmod(path, PRIVATE_FILE_MODE).catch(() => undefined);
}
