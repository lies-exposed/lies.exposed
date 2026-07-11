import { type DepsMocks, mocks } from "@liexp/backend/lib/test/mocks.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import supertest from "supertest";
import type TestAgent from "supertest/lib/agent.js";
import { makeApp } from "../src/app/make.js";
import { type AgentContext } from "../src/context/context.type.js";
import { getAgentContext } from "../src/context/load.js";

export interface AgentEvalTest {
  ctx: AgentContext;
  mocks: DepsMocks;
  req: TestAgent<supertest.Test>;
}

export const loadAgentEvalTestContext = async (
  logger: Logger,
): Promise<AgentContext> => {
  // Create a minimal agent context with mocked dependencies
  const env = {
    NODE_ENV: "test",
    SERVER_HOST: "localhost",
    SERVER_PORT: 4000,
    JWT_SECRET: "test-secret",
    DEBUG: "-",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    OPENAI_BASE_URL: "https://ai.ascariandrea.it",
    LOCALAI_MAX_RETRIES: 3,
    LOCALAI_MODEL: "qwen3.6-35b-a3b",
    API_TOKEN: "my-token",
    API_BASE_URL: "http://api.liexp.dev/v1",
    MCP_URL: "https://api.liexp.dev/mcp",
    BRAVE_API_KEY: "null",
    SENTRY_DSN: null,
  };

  const ctx = pipe(getAgentContext(logger)(env), throwTE);

  return Promise.resolve(ctx);
};

export const initAgentTest = async (
  ctx: AgentContext,
): Promise<AgentEvalTest> => {
  const app = makeApp(ctx);
  const req = supertest(app);

  return Promise.resolve({
    ctx,
    mocks,
    req,
  });
};

const g = global as unknown as {
  agentEvalTest: AgentEvalTest;
  agentContext: AgentContext;
};

export const GetAgentEvalTest = async (): Promise<AgentEvalTest> => {
  if (!g.agentEvalTest) {
    throw new Error(
      "Agent test not initialized. Ensure testSetup.ts is loaded.",
    );
  }
  return Promise.resolve(g.agentEvalTest);
};
