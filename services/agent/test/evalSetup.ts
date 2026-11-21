import path from "path";
import { fileURLToPath } from "url";
import { GetLogger } from "@liexp/core";
import { loadENV } from "@liexp/core/lib/env/utils.js";
import * as D from "debug";
import { beforeAll, beforeEach, vi } from "vitest";
import {
  type AgentEvalTest,
  initAgentTest,
  loadAgentEvalTestContext,
} from "./AgentEvalTest.js";
import { type AgentContext } from "../src/context/context.type.js";

// Resolve the service root from this file's location (test/evalSetup.ts → services/agent/)
// rather than process.cwd() which is the monorepo root when run via pnpm --filter.
const SERVICE_ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");

loadENV(SERVICE_ROOT, ".env.local");
loadENV(SERVICE_ROOT, ".env");

const logger = GetLogger("agent-eval-testSetup");

declare global {
  var agentContext: AgentContext | undefined;
  var agentEvalTest: AgentEvalTest | undefined;
}

beforeAll(async () => {
  D.enable(process.env.DEBUG ?? "-");

  globalThis.agentContext ??= await loadAgentEvalTestContext(logger);

  logger.debug.log("agent context initialized", !!globalThis.agentContext);

  globalThis.agentEvalTest = await initAgentTest(globalThis.agentContext);
});

beforeEach(() => {
  vi.clearAllMocks();
});
