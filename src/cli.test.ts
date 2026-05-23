import { describe, expect, test } from "bun:test";

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
    expect(result.stdout).toContain("workspace");
    expect(result.stdout).toContain("cache");
    expect(result.stdout).toContain("project");
    expect(result.stdout).toContain("task");
    expect(result.stdout).toContain("comment");
    expect(result.stdout).toContain("link");
    expect(result.stdout).toContain("reference");
    expect(result.stdout).toContain("board");
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
