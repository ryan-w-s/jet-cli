const binary = process.env["JET_BINARY"] ?? "dist/jet.js";

if (!(await Bun.file("skills/jet/SKILL.md").exists())) {
  console.error("Bundled JET skill is missing: skills/jet/SKILL.md");
  process.exit(1);
}

for (const args of [["--help"], ["context"]]) {
  const proc = Bun.spawn(["node", binary, ...args], {
    env: {
      ...process.env,
      JET_API_URL: "https://api.example.test",
      JET_API_KEY: "jet_secret",
      JET_WORKSPACE: "acme",
      JET_PROJECT: "JET",
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (exitCode !== 0) {
    console.error(stderr || stdout);
    process.exit(exitCode);
  }
  if (!stdout.trim()) {
    console.error(`Smoke command produced no output: jet ${args.join(" ")}`);
    process.exit(1);
  }
}

console.log("Packaged CLI smoke test passed.");
