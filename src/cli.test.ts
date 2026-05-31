import { describe, expect, test } from "bun:test";
import { buildSkillsAddArgs } from "./commands/skills.js";

describe("jet command", () => {
  test("prints the current package version", async () => {
    const packagePath = "package.json";
    const originalPackageJson = await Bun.file(packagePath).text();
    const packageJson = JSON.parse(originalPackageJson) as { version: string };
    packageJson.version = "9.8.7-test";

    try {
      await Bun.write(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

      const result = await runCli(["--version"]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout.trim()).toBe("9.8.7-test");
    } finally {
      await Bun.write(packagePath, originalPackageJson);
    }
  });

  test("lists the release command surface in help", async () => {
    const result = await runCli(["--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).not.toContain("\n  auth ");
    expect(result.stdout).toContain("workspace");
    expect(result.stdout).toContain("cache");
    expect(result.stdout).toContain("project");
    expect(result.stdout).toContain("task");
    expect(result.stdout).toContain("comment");
    expect(result.stdout).toContain("link");
    expect(result.stdout).toContain("reference");
    expect(result.stdout).toContain("board");
    expect(result.stdout).toContain("skills");
    expect(result.stdout).toContain("status");
    expect(result.stdout).toContain("label");
    expect(result.stdout).toContain("priority");
    expect(result.stdout).toContain("type");
  });

  test("prints resolved context as JSON without requiring API access", async () => {
    const result = await runCli([
      "--api-url",
      "https://api.example.test",
      "--api-key",
      "jet_secret",
      "--workspace",
      "acme",
      "--project",
      "JET",
      "context",
    ]);

    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      apiUrl: "https://api.example.test",
      hasApiKey: true,
      workspace: "acme",
      project: "JET",
      output: "human",
    });
  });

  test("lists cache flags in help", async () => {
    const result = await runCli(["--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("--no-cache");
    expect(result.stdout).toContain("--refresh");
  });

  test("lists skills install command in help", async () => {
    const result = await runCli(["skills", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("install");
  });

  test("lists forwarded npx skills options in install help", async () => {
    const result = await runCli(["skills", "install", "--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("--agent");
    expect(result.stdout).toContain("--global");
    expect(result.stdout).toContain("--copy");
    expect(result.stdout).toContain("--yes");
    expect(result.stdout).toContain("--all");
  });

  test("installs the bundled skill by frontmatter name", () => {
    expect(buildSkillsAddArgs("skills-dir")).toEqual([
      "skills",
      "add",
      "skills-dir",
      "--skill",
      "just-easy-tasks",
    ]);
  });
});

async function runCli(
  args: string[],
  env: Record<string, string> = {},
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(["bun", "run", "src/cli.ts", ...args], {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { exitCode, stdout, stderr };
}
