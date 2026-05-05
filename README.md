# JET CLI

Command line interface for Just Easy Tasks.

JET is API-first, and the CLI mirrors that shape while keeping common task
workflows short for humans and predictable for agents.

## Install

```sh
npm install -g jet-cli
jet --help
```

For local development:

```sh
bun install
bun run dev -- --help
bun run check
```

The published package requires Node.js 22 or newer. Bun is used for development,
tests, builds, and release checks.

## Configure

```sh
jet config set api-key jet_your_secret_here
jet use workspace acme
jet use project JET
jet auth status
```

The CLI uses `https://justeasytasks.com` by default. To point at another API,
set `--api-url`, `JET_API_URL`, or `jet config set api-url <url>`.

Config precedence is:

1. User config: `%APPDATA%/jet/config.json` on Windows, otherwise
   `$XDG_CONFIG_HOME/jet/config.json` or `~/.config/jet/config.json`.
2. Local project config found by walking up to `.jet/config.json`.
3. Environment variables: `JET_API_URL`, `JET_API_KEY`, `JET_WORKSPACE`,
   `JET_PROJECT`, `JET_OUTPUT`.
4. CLI flags: `--api-url`, `--api-key`, `--workspace`, `--project`, `--json`.

API keys are stored as plaintext when saved with `jet config set api-key`.
Use environment variables or your platform secret manager if local plaintext
storage is not acceptable.

## Commands

Core commands:

```sh
jet context
jet auth status
jet auth keys list
jet auth keys create "Laptop"
jet auth keys revoke <api-key-id> --force
```

Workspace and project commands:

```sh
jet workspace list
jet workspace get acme
jet workspace create acme "Acme"
jet workspace member list
jet workspace invite create teammate@example.com
jet project list
jet project create JET "Just Easy Tasks"
```

Task workflows:

```sh
jet task list
jet task list login --status open
jet task create "Fix login" --status open --priority high --label bug
jet task get JET-123
jet task update JET-123 --status in-progress --assignee <user-id>
jet task done JET-123
jet task delete JET-123 --force
```

Task targets can be `JET-123`, `acme/JET-123`, a numeric task number when a
default project is configured, or a title fragment resolved by the API.

Project metadata:

```sh
jet status list
jet status create done Done --category done --rank 100
jet label create bug Bug --color red
jet type create task Task
jet priority create high High --rank 100
```

Comments, links, references, and boards:

```sh
jet comment add JET-123 "I can reproduce this."
jet comment update JET-123 <comment-id> "Updated note"
jet link create JET-123 JET-124 --type blocks
jet reference create JET-123 https://example.com --title "Spec"
jet board create active "Active work" --filters '{"statusKey":"open"}'
```

Destructive commands prompt by default. Use `--force` for scripts. Use
`--no-input` to make the CLI fail instead of prompting.

## Agent Usage

Every command supports global `--json` for machine-readable output:

```sh
jet --json task get JET-123
jet --json task list --status open
```

Errors in JSON mode include an `error` code and `message`; API errors also
include HTTP `status` and backend `detail`.

For non-interactive agents, prefer:

```sh
jet --json --no-input task list
jet --json --no-input task delete JET-123 --force
```

## API Compatibility

The CLI is generated against `openapi.json` in this repository and the checked-in
types in `src/generated/schema.d.ts`. Regenerate types from a running API:

```sh
JET_OPENAPI_URL=http://127.0.0.1:8000/api/openapi.json bun run generate:api
```

Or from a pinned file:

```sh
JET_OPENAPI_FILE=openapi.json bun run generate:api
```

CI runs `bun run check:schema` to catch stale generated types.

## Development And Release

```sh
bun run typecheck
bun test
bun run check:schema
bun run build
bun run smoke:package
bun run smoke:api
bun run check
bun run pack:check
```

`smoke:api` is optional unless `JET_SMOKE_API_URL` and `JET_SMOKE_API_KEY` are
set. When `JET_SMOKE_WORKSPACE` and `JET_SMOKE_PROJECT` are also set, it checks
project-scoped task, status, label, and board endpoints.
