import type { AddressInfo } from "net";
import type { Server } from "node:http";
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

export interface AgentAppTest {
  ctx: AgentContext;
  mocks: DepsMocks;
  req: TestAgent<supertest.Test>;
}

/**
 * Creates a mock agent provider for testing
 */
const createMockAgentProvider = () => ({
  invoke: () =>
    TE.right({
      messages: [
        {
          id: "test-msg-id",
          content: "This is a test response from the agent",
        },
      ],
    }),
  agent: {
    stream: function* () {
      yield [
        "messages",
        [
          {
            content: "Test streaming response",
          },
        ],
      ];
    },
  },
});

export const loadAgentContext = async (
  logger: Logger,
): Promise<AgentContext> => {
  // Create a minimal agent context with mocked dependencies
  const ctx: AgentContext = {
    env: {
      NODE_ENV: "test",
      SERVER_HOST: "localhost",
      SERVER_PORT: 4000,
      JWT_SECRET: "test-secret",
      DEBUG: "-",
      LOCALAI_API_KEY: "test-key",
      LOCALAI_BASE_URL: "http://test-localai.liexp.test",
      LOCALAI_MODEL: "qwen3-4b",
      LOCALAI_MAX_RETRIES: 3,
      AI_PROVIDER: "openai",
      API_TOKEN: "my-token",
      API_BASE_URL: "http://api.liexp.test",
      BRAVE_API_KEY: "null",
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
    agent: createMockAgentProvider() as any,
  };

  return Promise.resolve(ctx);
};

export const initAgentTest = async (
  ctx: AgentContext,
): Promise<AgentAppTest> => {
  const app = makeApp(ctx);
  const req = supertest(app);

  return Promise.resolve({
    ctx,
    mocks,
    req,
  });
};

export const startAppServer = async (
  ctx: AgentContext,
): Promise<{ server: Server; port: number }> => {
  const app = makeApp(ctx);
  const server = app.listen(0);

  await new Promise<void>((resolve, reject) => {
    server.on("listening", () => resolve());
    server.on("error", (e) => reject(e));
  });

  const addr = server.address() as AddressInfo;

  return { server, port: addr.port };
};

export const stopAppServer = async (server: Server): Promise<void> =>
  new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) return reject(err);
      resolve(undefined);
    });
  });

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
