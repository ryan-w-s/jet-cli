import { describe, expect, test } from "bun:test";

import { CliUsageError } from "../resolution/task-target.js";
import {
  compactObject,
  confirmDestructiveAction,
  parseJsonObject,
  requireApiConfig,
} from "./shared.js";

describe("requireApiConfig", () => {
  test("uses the hosted API URL by default", () => {
    expect(requireApiConfig({ apiKey: "jet_secret" })).toEqual({
      apiUrl: "https://justeasytasks.com",
      apiKey: "jet_secret",
    });
  });

  test("requires an API key", () => {
    expect(() => requireApiConfig({ apiUrl: "http://127.0.0.1:8000" })).toThrow(
      CliUsageError,
    );
    expect(() => requireApiConfig({ apiUrl: "http://127.0.0.1:8000" })).toThrow(
      "API key is required.",
    );
  });

  test("returns API client options when configured", () => {
    expect(
      requireApiConfig({
        apiUrl: "http://127.0.0.1:8000",
        apiKey: "jet_secret",
        workspace: "acme",
      }),
    ).toEqual({
      apiUrl: "http://127.0.0.1:8000",
      apiKey: "jet_secret",
    });
  });
});

describe("shared command helpers", () => {
  test("compacts undefined values without dropping null or false", () => {
    expect(
      compactObject({ keep: false, empty: null, drop: undefined }) as Record<
        string,
        unknown
      >,
    ).toEqual({
      keep: false,
      empty: null,
    });
  });

  test("parses JSON object options", () => {
    expect(parseJsonObject('{"status":"open"}')).toEqual({ status: "open" });
    expect(parseJsonObject(undefined)).toEqual({});
    expect(() => parseJsonObject("[]")).toThrow("Expected a JSON object.");
  });

  test("requires --force for destructive actions when input is disabled", async () => {
    await expect(
      confirmDestructiveAction(
        {
          config: {},
          noInput: true,
        },
        {},
        "Delete task JET-1?",
      ),
    ).rejects.toThrow("Re-run with --force");

    await expect(
      confirmDestructiveAction(
        {
          config: {},
          noInput: true,
        },
        { force: true },
        "Delete task JET-1?",
      ),
    ).resolves.toBeUndefined();
  });
});
