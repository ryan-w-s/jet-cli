import { readFile, writeFile } from "node:fs/promises";

import openapiTS, { astToString } from "openapi-typescript";

const source =
  process.env["JET_OPENAPI_FILE"] ??
  process.env["JET_OPENAPI_URL"] ??
  "http://127.0.0.1:8000/api/openapi.json";
const output = "src/generated/schema.d.ts";

const input: Parameters<typeof openapiTS>[0] = source.startsWith("http")
  ? new URL(source)
  : (JSON.parse(await readFile(source, "utf8")) as Parameters<typeof openapiTS>[0]);
const ast = await openapiTS(input);
await writeFile(output, astToString(ast));
console.log(`Generated ${output} from ${source}`);
