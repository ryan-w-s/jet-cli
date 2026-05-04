import { writeFile } from "node:fs/promises";

import openapiTS, { astToString } from "openapi-typescript";

const source = process.env["JET_OPENAPI_URL"] ?? "http://127.0.0.1:8000/api/openapi.json";
const output = "src/generated/schema.d.ts";

const ast = await openapiTS(new URL(source));
await writeFile(output, astToString(ast));
console.log(`Generated ${output} from ${source}`);
