import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import openapiTS, { astToString } from "openapi-typescript";

const source = process.env["JET_OPENAPI_FILE"] ?? "openapi.json";
const generatedPath = "src/generated/schema.d.ts";

const document = JSON.parse(
  await readFile(source, "utf8"),
) as Parameters<typeof openapiTS>[0];
const ast = await openapiTS(document);
const expected = astToString(ast);
const actual = await readFile(generatedPath, "utf8");

if (actual !== expected) {
  const diffPath = join(tmpdir(), "jet-cli-schema.expected.d.ts");
  await writeFile(diffPath, expected);
  console.error(
    `Generated schema is stale. Run \`bun run generate:api\` or compare with ${diffPath}.`,
  );
  process.exit(1);
}

console.log("Generated schema is up to date.");
