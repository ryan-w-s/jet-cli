# JET CLI

Command line interface for Just Easy Tasks.

## Development

```sh
bun install
bun run typecheck
bun run src/cli.ts --help
```

Generate OpenAPI types from a running API:

```sh
JET_OPENAPI_URL=http://127.0.0.1:8000/api/openapi.json bun run generate:api
```

## First Use

```sh
jet config set api-url http://127.0.0.1:8000
jet config set api-key jet_your_secret_here
jet use workspace acme
jet use project JET
jet task list
jet task get JET-1
```
