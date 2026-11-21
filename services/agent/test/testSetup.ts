import { GetLogger } from "@liexp/core/lib/logger/Logger.js";
import D from "debug";
import { beforeAll, beforeEach, vi } from "vitest";
import { loadAgentContext, initAgentTest } from "./AgentTest.js";

// Agent-specific mocks - must be at top level for vitest hoisting
vi.mock("puppeteer-core", () => ({ KnownDevices: {} }));

const logger = GetLogger("agent-testSetup");

beforeAll(async () => {
  D.enable(process.env.DEBUG ?? "-");

  globalThis.agentContext ??= await loadAgentContext(logger);

  logger.debug.log("agent context initialized", !!globalThis.agentContext);

  globalThis.agentTest = await initAgentTest(globalThis.agentContext);
});

beforeEach(() => {
  vi.clearAllMocks();
});
