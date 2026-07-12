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

// Resolve the service root from this file's location (test/evalSetup.ts → services/agent/)
// rather than process.cwd() which is the monorepo root when run via pnpm --filter.
const SERVICE_ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");

loadENV(SERVICE_ROOT, ".env.local");
loadENV(SERVICE_ROOT, ".env");

const logger = GetLogger("agent-eval-testSetup");

const g = global as unknown as {
  agentContext: any;
  agentEvalTest?: AgentEvalTest;
};

beforeAll(async () => {
  D.enable(process.env.DEBUG ?? "-");

  if (!g.agentContext) {
    logger.debug.log("loading agent context");
    g.agentContext = await loadAgentEvalTestContext(logger);
  }

  logger.debug.log("agent context initialized", !!g.agentContext);

  g.agentEvalTest = await initAgentTest(g.agentContext);
});

beforeEach(() => {
  vi.clearAllMocks();
});
