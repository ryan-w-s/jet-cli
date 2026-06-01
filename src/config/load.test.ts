import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  compactConfig,
  findUp,
  isTrustedLocalApiUrl,
  mergeConfigSources,
  parseCache,
  parseOutput,
  sanitizeLocalConfig,
} from "./load.js";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((path) => rm(path, { recursive: true })));
});

async function makeTempDir(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), "jet-cli-config-"));
  tempDirs.push(path);
  return path;
}

describe("compactConfig", () => {
  test("drops undefined and empty string values", () => {
    expect(
      compactConfig({
        apiUrl: "http://127.0.0.1:8000",
        apiKey: "",
        workspace: undefined,
        project: "JET",
      }),
    ).toEqual({
      apiUrl: "http://127.0.0.1:8000",
      project: "JET",
    });
  });
});

describe("parseOutput", () => {
  test("accepts supported output formats only", () => {
    expect(parseOutput("json")).toBe("json");
    expect(parseOutput("human")).toBe("human");
    expect(parseOutput("yaml")).toBeUndefined();
    expect(parseOutput(undefined)).toBeUndefined();
  });
});

describe("parseCache", () => {
  test("accepts supported cache modes only", () => {
    expect(parseCache("on")).toBe("on");
    expect(parseCache("off")).toBe("off");
    expect(parseCache("false")).toBeUndefined();
    expect(parseCache(undefined)).toBeUndefined();
  });
});

describe("mergeConfigSources", () => {
  test("applies user, local, env, then CLI precedence", () => {
    expect(
      mergeConfigSources(
        {
          apiUrl: "https://user.example",
          apiKey: "user-key",
          workspace: "user-workspace",
          project: "USER",
        },
        {
          apiUrl: "https://local.example",
          workspace: "local-workspace",
        },
        {
          apiKey: "env-key",
          workspace: "env-workspace",
          output: "human",
        },
        {
          workspace: "cli-workspace",
          output: "json",
        },
      ),
    ).toEqual({
      apiUrl: "https://local.example",
      apiKey: "env-key",
      workspace: "cli-workspace",
      project: "USER",
      output: "json",
    });
  });
});

describe("sanitizeLocalConfig", () => {
  test("allows local API URLs for loopback and private development hosts when a local key is also provided", () => {
    const urls = [
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      "http://[::1]:8000",
      "http://10.1.2.3:8000",
      "http://172.16.0.1:8000",
      "http://172.31.255.255:8000",
      "http://192.168.1.10:8000",
    ];

    for (const apiUrl of urls) {
      expect(isTrustedLocalApiUrl(apiUrl)).toBe(true);
      expect(sanitizeLocalConfig({ apiUrl, apiKey: "local-key", workspace: "acme" })).toEqual({
        apiUrl,
        apiKey: "local-key",
        workspace: "acme",
      });
    }
  });

  test("drops local API URLs that would otherwise reuse a user or environment API key", () => {
    expect(
      sanitizeLocalConfig({
        apiUrl: "http://127.0.0.1:8000",
        workspace: "acme",
        project: "JET",
      }),
    ).toEqual({
      workspace: "acme",
      project: "JET",
    });
  });

  test("ignores public local API URLs while preserving non-network settings", () => {
    expect(
      sanitizeLocalConfig({
        apiUrl: "https://attacker.example",
        apiKey: "local-key",
        workspace: "acme",
        project: "JET",
        output: "json",
        cache: "off",
      }),
    ).toEqual({
      apiKey: "local-key",
      workspace: "acme",
      project: "JET",
      output: "json",
      cache: "off",
    });
  });

  test("rejects malformed and non-private local API URLs", () => {
    expect(isTrustedLocalApiUrl("not a url")).toBe(false);
    expect(isTrustedLocalApiUrl("https://example.com")).toBe(false);
    expect(isTrustedLocalApiUrl("http://172.15.0.1")).toBe(false);
    expect(isTrustedLocalApiUrl("http://172.32.0.1")).toBe(false);
    expect(isTrustedLocalApiUrl("http://192.167.1.1")).toBe(false);
  });
});

describe("findUp", () => {
  test("finds local config files from a nested directory", async () => {
    const root = await makeTempDir();
    const configDir = join(root, ".jet");
    const nested = join(root, "packages", "cli");
    await mkdir(configDir);
    await mkdir(nested, { recursive: true });
    const configPath = join(configDir, "config.json");
    await writeFile(configPath, "{}\n");

    expect(findUp(".jet/config.json", nested)).toBe(configPath);
  });

  test("returns null when no parent contains the target", async () => {
    const root = await makeTempDir();
    const nested = join(root, "empty");
    await mkdir(nested);

    expect(findUp(".jet/config.json", nested)).toBeNull();
  });
});
