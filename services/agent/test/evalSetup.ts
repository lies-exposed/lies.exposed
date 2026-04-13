import path from "path";
import { fileURLToPath } from "url";
import { loadENV } from "@liexp/core/lib/env/utils.js";

/**
 * Global setup for agent eval tests.
 *
 * Loads .env.local so real provider keys and endpoints are available.
 * MSW is intentionally NOT started here — it intercepts Node.js fetch/http
 * calls (including the LLM streaming SSE) and breaks streaming even in bypass
 * mode. The CLI tool runs in a child process so MSW cannot intercept those
 * API calls anyway.
 */

// Resolve the service root from this file's location (test/evalSetup.ts → services/agent/)
// rather than process.cwd() which is the monorepo root when run via pnpm --filter.
const SERVICE_ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");

loadENV(SERVICE_ROOT, ".env.local");
loadENV(SERVICE_ROOT, ".env");
