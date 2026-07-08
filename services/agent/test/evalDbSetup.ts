import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { loadENV } from "@liexp/core/lib/env/utils.js";

/**
 * Per-worker setup for the "agent-eval-db" project.
 *
 * Runs in every test file's worker (unlike evalDbGlobalSetup.ts, which runs
 * once in a separate process). Reads the runtime info written by global
 * setup and injects it into process.env *before* API_BASE_URL/API_TOKEN so
 * liexp_cli (spawned as a child process by the agent factory) talks to the
 * throwaway api-test server/DB instead of dev.
 */

const SERVICE_ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const RUNTIME_FILE = path.resolve(SERVICE_ROOT, ".eval-db-runtime.json");

interface RuntimeInfo {
  apiBaseUrl: string;
  apiToken: string;
  dbHost: string;
  dbPort: number;
  dbUsername: string;
  dbPassword: string;
  dbDatabase: string;
}

// LLM provider creds (OPENAI_*, BRAVE_API_KEY, LOCALAI_MODEL, ...) still come
// from .env.local — only the platform API/DB are swapped for the test stack.
loadENV(SERVICE_ROOT, ".env.local");
loadENV(SERVICE_ROOT, ".env");

const runtime = JSON.parse(
  fs.readFileSync(RUNTIME_FILE, "utf-8"),
) as RuntimeInfo;

process.env.API_BASE_URL = runtime.apiBaseUrl;
process.env.API_TOKEN = runtime.apiToken;
process.env.MCP_URL = "";
process.env.DB_HOST = runtime.dbHost;
process.env.DB_PORT = String(runtime.dbPort);
process.env.DB_USERNAME = runtime.dbUsername;
process.env.DB_PASSWORD = runtime.dbPassword;
process.env.DB_DATABASE = runtime.dbDatabase;
