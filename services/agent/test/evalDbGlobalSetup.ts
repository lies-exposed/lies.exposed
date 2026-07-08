import * as fs from "fs";
import * as path from "path";
import { type ChildProcess, spawn } from "child_process";
import { fileURLToPath } from "url";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import {
  AdminRead,
  MCPToolsAccess,
} from "@liexp/io/lib/http/auth/permissions/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { type ServiceClient } from "@liexp/io/lib/http/auth/service-client/ServiceClient.js";
import { Client as PGClient } from "pg";

/**
 * Global setup for the "agent-eval-db" project.
 *
 * Unlike vitest.config.eval.ts (which hits the shared liexp.dev dev API/DB),
 * this tier gives every full run of `pnpm test:eval-db` its own throwaway
 * Postgres database (`liexp_test`) and its own API server instance, so
 * liexp_cli tool calls actually persist somewhere we can query and clean up
 * without touching dev data.
 *
 * Runs once per `vitest run`, before any test files. Writes the resulting
 * API/DB connection info to .eval-db-runtime.json, which evalDbSetup.ts
 * (a per-worker setupFile) reads back into process.env.
 */

const SERVICE_ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const REPO_ROOT = path.resolve(SERVICE_ROOT, "../..");
const API_ROOT = path.resolve(REPO_ROOT, "services/api");
const API_ENV_TEST_PATH = path.resolve(API_ROOT, ".env.test");
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

const parseDotenv = (src: string): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const line of src.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      val.length >= 2 &&
      ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'")))
    ) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
};

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
    `api-test server did not become healthy within ${timeoutMs}ms: ${String(lastError)}`,
  );
};

/**
 * Signs a service-client JWT locally, mirroring
 * services/api/src/utils/serviceClientTokenGenerator.ts#createAgentServiceClient.
 * Not imported directly since it lives inside the api service (not exported
 * from @liexp/backend), and reproducing it here is 5 lines.
 */
const mintAgentToken = (jwtSecret: string): string => {
  const jwt = GetJWTProvider({ secret: jwtSecret, logger: setupLogger });
  const serviceClient = {
    id: uuid(),
    userId: uuid(),
    email: "agent-eval-db@lies.exposed",
    permissions: [AdminRead.literals[0], MCPToolsAccess.literals[0]],
  } as ServiceClient;
  return jwt.signClient(serviceClient)();
};

const recreateTestDatabase = async (env: Record<string, string>): Promise<void> => {
  const admin = new PGClient({
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: "postgres",
  });
  await admin.connect();
  try {
    await admin.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [env.DB_DATABASE],
    );
    await admin.query(`DROP DATABASE IF EXISTS "${env.DB_DATABASE}"`);
    await admin.query(
      `CREATE DATABASE "${env.DB_DATABASE}" OWNER "${env.DB_USERNAME}"`,
    );
    setupLogger.info.log(`Recreated database "${env.DB_DATABASE}"`);
  } finally {
    await admin.end();
  }
};

export default async function setup(): Promise<() => Promise<void>> {
  const testEnv = parseDotenv(fs.readFileSync(API_ENV_TEST_PATH, "utf-8"));

  await recreateTestDatabase(testEnv);

  const apiToken = mintAgentToken(testEnv.JWT_SECRET);

  setupLogger.info.log(
    `Starting api-test server on ${testEnv.SERVER_HOST}:${testEnv.SERVER_PORT}...`,
  );

  const tsxBin = path.resolve(API_ROOT, "node_modules/.bin/tsx");
  const apiProcess: ChildProcess = spawn(tsxBin, ["src/run.ts"], {
    cwd: API_ROOT,
    env: { ...testEnv, PATH: process.env.PATH, NODE_ENV: "test" },
    stdio: process.env.DEBUG_EVAL ? "inherit" : "ignore",
  });

  apiProcess.on("error", (err) => {
    setupLogger.error.log("api-test process failed to start: %s", err);
  });

  let apiExitedEarly: string | undefined;
  apiProcess.once("exit", (code, signal) => {
    if (code !== 0 && code !== null) {
      apiExitedEarly = `api-test exited early with code ${code} (signal ${signal})`;
    }
  });

  const apiBaseUrl = `http://127.0.0.1:${testEnv.SERVER_PORT}/v1`;

  try {
    await waitForHealthcheck(`${apiBaseUrl}/healthcheck`, 60_000);
  } catch (err) {
    apiProcess.kill();
    throw apiExitedEarly ? new Error(apiExitedEarly) : err;
  }
  if (apiExitedEarly) {
    throw new Error(apiExitedEarly);
  }

  setupLogger.info.log(`api-test server healthy at ${apiBaseUrl}`);

  const runtime: RuntimeInfo = {
    apiBaseUrl,
    apiToken,
    dbHost: testEnv.DB_HOST,
    dbPort: Number(testEnv.DB_PORT),
    dbUsername: testEnv.DB_USERNAME,
    dbPassword: testEnv.DB_PASSWORD,
    dbDatabase: testEnv.DB_DATABASE,
  };
  fs.writeFileSync(RUNTIME_FILE, JSON.stringify(runtime, null, 2));

  return async function teardown() {
    setupLogger.info.log("Tearing down api-test server...");
    apiProcess.kill();
    // give it a beat to release its DB connections before the next run's
    // recreateTestDatabase() tries to terminate/drop the database.
    await wait(500);
    if (fs.existsSync(RUNTIME_FILE)) {
      fs.unlinkSync(RUNTIME_FILE);
    }
  };
}
