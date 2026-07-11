import path from "path";
import { GetAgentFactory } from "@liexp/backend/lib/providers/ai/agent.factory.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import puppeteerMock from "@liexp/backend/lib/test/mocks/puppeteer.mock.js";
import { type DepsMocks, mocks } from "@liexp/backend/lib/test/mocks.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { type AxiosInstance } from "axios";
import * as TE from "fp-ts/lib/TaskEither.js";
import supertest from "supertest";
import type TestAgent from "supertest/lib/agent.js";
import { makeApp } from "../src/app/make.js";
import { type AgentContext } from "../src/context/context.type.js";
import { createMcpClient } from "../src/mcp/mcp.client.js";
import { createCliExecutorTool } from "#tools/cli-executor.tool.js";

export interface AgentEvalTest {
  ctx: AgentContext;
  mocks: DepsMocks;
  req: TestAgent<supertest.Test>;
}

export const loadAgentContext = async (
  logger: Logger,
): Promise<AgentContext> => {
  // Create a minimal agent context with mocked dependencies
  const ctx: Omit<AgentContext, "agentFactory"> = {
    env: {
      NODE_ENV: "test",
      SERVER_HOST: "localhost",
      SERVER_PORT: 4000,
      JWT_SECRET: "test-secret",
      DEBUG: "-",
      OPENAI_API_KEY: "test-key",
      OPENAI_BASE_URL: "http://test-localai.liexp.test",
      LOCALAI_MAX_RETRIES: 3,
      API_TOKEN: "my-token",
      API_BASE_URL: "http://api.liexp.test/v1",
      MCP_URL: "https://api.liexp.test/mcp",
      BRAVE_API_KEY: "null",
      SENTRY_DSN: null,
    },
    logger,
    jwt: GetJWTProvider({ secret: "test-secret", logger }),
    http: HTTPProvider(mocks.axios as any as AxiosInstance),
    puppeteer: GetPuppeteerProvider(
      puppeteerMock,
      { headless: "shell" },
      puppeteerMock.devices,
    ),
    langchain: {} as any,
    fs: {
      getObject: (_path: string) => TE.right("# Mock AGENTS.md"),
    } as any,
  };

  const agentFactory = GetAgentFactory({
    mcpClient: createMcpClient(ctx.env),
    cliTool: createCliExecutorTool(
      path.resolve(process.cwd(), "build/cli/cli.js"),
    ),
    apiKeys: {
      openai: ctx.env.OPENAI_API_KEY,
      anthropic: ctx.env.ANTHROPIC_API_KEY,
      xai: ctx.env.XAI_API_KEY,
    },
  })({
    langchain: ctx.langchain,
    logger: ctx.logger,
    puppeteer: ctx.puppeteer,
    brave: {} as any,
    fs: ctx.fs,
  });

  return Promise.resolve({ ...ctx, agentFactory });
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
