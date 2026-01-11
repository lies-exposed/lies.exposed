import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { type DepsMocks, mocks } from "@liexp/backend/lib/test/mocks.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { type AxiosInstance } from "axios";
import { type AgentContext } from "../src/context/context.type.js";

export interface AgentAppTest {
  ctx: AgentContext;
  mocks: DepsMocks;
}

export const loadAgentContext = async (
  logger: Logger,
): Promise<AgentContext> => {
  // Create a minimal agent context with mocked dependencies
  const ctx: AgentContext = {
    env: {
      NODE_ENV: "test",
      PUPPETEER_EXECUTABLE_PATH: "/usr/bin/chromium",
      JWT_SECRET: "test-secret",
      MCP_AUTH_URL: "http://localhost:4000",
    } as any,
    logger,
    jwt: GetJWTProvider({ secret: "test-secret", logger }),
    http: HTTPProvider(mocks.axios as any as AxiosInstance),
    puppeteer: GetPuppeteerProvider(
      mocks.puppeteer,
      { headless: "shell" },
      mocks.puppeteer.devices,
    ),
    langchain: {} as any,
    agent: {} as any,
  };

  return Promise.resolve(ctx);
};

export const initAgentTest = async (
  ctx: AgentContext,
): Promise<AgentAppTest> => {
  return Promise.resolve({
    ctx,
    mocks,
  });
};

const g = global as unknown as {
  agentTest: AgentAppTest;
  agentContext: AgentContext;
};

export const GetAgentTest = async (): Promise<AgentAppTest> => {
  if (!g.agentTest) {
    throw new Error(
      "Agent test not initialized. Ensure testSetup.ts is loaded.",
    );
  }
  return Promise.resolve(g.agentTest);
};
