import { afterAll, afterEach, beforeAll } from "vitest";
import { mswServer } from "./mswServer.js";

/**
 * Global MSW lifecycle for the agent-spec vitest project.
 * Registered as a setupFile so it runs once per worker, before any test file.
 */
beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  mswServer.resetHandlers();
});

afterAll(() => {
  mswServer.close();
});
