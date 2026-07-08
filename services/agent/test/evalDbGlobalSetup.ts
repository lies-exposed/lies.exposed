import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { loadENV } from "@liexp/core/lib/env/utils.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";

/**
 * Global setup for the "agent-eval-db" project.
 *
 * Points liexp_cli tool calls at the already-running local dev stack
 * (`docker compose up api.liexp.dev db.liexp.dev ...`) instead of spinning up
 * a throwaway API/DB per run — spinning up our own (first via docker-compose
 * postgres, then via an in-memory PGlite instance) turned out to add 60-90s+
 * of cold-start cost to every single run, which is worse than just reusing
 * the dev stack that's normally already up. Tests are responsible for their
 * own cleanup (see the `createdAt`-scoped deletes in *.eval-db.ts), same
 * discipline as vitest.config.eval.ts's plain "eval" tier already requires.
 *
 * Runs once per `vitest run`, before any test files. Writes the resulting
 * API/DB connection info to .eval-db-runtime.json, which evalDbSetup.ts
 * (a per-worker setupFile) reads back into process.env.
 */

const SERVICE_ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const RUNTIME_FILE = path.resolve(SERVICE_ROOT, ".eval-db-runtime.json");

const setupLogger = GetLogger("agent-eval-db-setup");

interface RuntimeInfo {
  apiBaseUrl: string;
  apiToken: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword: string;
  dbDatabase: string;
}

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const waitForHealthcheck = async (
  url: string,
  timeoutMs: number,
): Promise<void> => {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
      lastError = new Error(`healthcheck responded with ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    await wait(500);
  }
  throw new Error(
    `${url} did not become healthy within ${timeoutMs}ms: ${String(lastError)}`,
  );
};

export default async function setup(): Promise<() => Promise<void>> {
  // OPENAI_*, BRAVE_API_KEY, API_BASE_URL, API_TOKEN, ... all come from
  // .env.local, the same file the plain "eval" tier uses.
  loadENV(SERVICE_ROOT, ".env.local");
  loadENV(SERVICE_ROOT, ".env");

  const apiBaseUrl = process.env.API_BASE_URL ?? "https://api.liexp.dev/v1";
  const apiToken = process.env.API_TOKEN;
  if (!apiToken) {
    throw new Error(
      "API_TOKEN is not set in services/agent/.env.local — required to authenticate liexp_cli against the dev API.",
    );
  }

  setupLogger.info.log(`Waiting for dev API at ${apiBaseUrl}...`);
  await waitForHealthcheck(`${apiBaseUrl}/healthcheck`, 60_000);
  setupLogger.info.log(`Dev API healthy at ${apiBaseUrl}`);

  const runtime: RuntimeInfo = {
    apiBaseUrl,
    apiToken,
    // Matches services/db.liexp.dev in compose.yml (port 8432 -> 5432, db
    // "liexp" not "liexp_test" — this is the real dev database).
    dbHost: process.env.EVAL_DB_HOST ?? "127.0.0.1",
    dbPort: Number(process.env.EVAL_DB_PORT ?? 8432),
    dbUsername: process.env.EVAL_DB_USERNAME ?? "liexp",
    dbPassword: process.env.EVAL_DB_PASSWORD ?? "liexp-password",
    dbDatabase: process.env.EVAL_DB_DATABASE ?? "liexp",
  };
  fs.writeFileSync(RUNTIME_FILE, JSON.stringify(runtime, null, 2));

  return async function teardown() {
    if (fs.existsSync(RUNTIME_FILE)) {
      fs.unlinkSync(RUNTIME_FILE);
    }
  };
}
