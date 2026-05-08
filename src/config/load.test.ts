import { afterEach, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  compactConfig,
  findUp,
  mergeConfigSources,
  parseCache,
  parseOutput,
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
