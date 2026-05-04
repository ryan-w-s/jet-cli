import { describe, expect, test } from "bun:test";

import { CliUsageError } from "../resolution/task-target.js";
import { requireApiConfig } from "./shared.js";

describe("requireApiConfig", () => {
  test("requires an API URL", () => {
    expect(() => requireApiConfig({ apiKey: "jet_secret" })).toThrow(CliUsageError);
    expect(() => requireApiConfig({ apiKey: "jet_secret" })).toThrow(
      "API URL is required.",
    );
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
