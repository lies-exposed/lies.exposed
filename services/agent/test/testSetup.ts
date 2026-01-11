import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import D from "debug";
import { beforeAll, beforeEach, vi } from "vitest";
import { type AgentAppTest, loadAgentContext, initAgentTest } from "./AppTest.js";

// Agent-specific mocks - must be at top level for vitest hoisting
vi.mock("puppeteer-core", () => ({ KnownDevices: {} }));

const logger = GetLogger("agent-testSetup");

const g = global as unknown as { agentContext: any; agentTest?: AgentAppTest };

beforeAll(async () => {
  D.enable(process.env.DEBUG ?? "-");

  if (!g.agentContext) {
    logger.debug.log("loading agent context");
    g.agentContext = await loadAgentContext(logger);
  }

  logger.debug.log("agent context initialized", !!g.agentContext);

  g.agentTest = await initAgentTest(g.agentContext);
});

beforeEach(() => {
  vi.clearAllMocks();
});
