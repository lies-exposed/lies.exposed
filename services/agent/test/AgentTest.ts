import type { AddressInfo } from "net";
import type { Server } from "node:http";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import puppeteerMock from "@liexp/backend/lib/test/mocks/puppeteer.mock.js";
import { type DepsMocks, mocks } from "@liexp/backend/lib/test/mocks.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { ctxHelper } from "@liexp/test/lib/index.js";
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
 * The axios mock is a `vitest-mock-extended` proxy of the `Axios` type, which
 * is structurally callable like an `AxiosInstance` at runtime. Widening
 * through `unknown` keeps the same object identity so tests can stub
 * `mocks.axios.get` and have it take effect in `ctx.http`.
 */
const testAxios = mocks.axios as unknown as AxiosInstance;

/**
 * Creates a mock compiled agent for testing (the shape the factory returns).
 */
const createMockAgent = () => ({
  invoke: () =>
    Promise.resolve({
      messages: [
        {
          id: "test-msg-id",
          content: "This is a test response from the agent",
        },
      ],
    }),
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
  *streamEvents() {
    yield {
      event: "on_chat_model_stream",
      run_id: "mock-run-1",
      name: "ChatOpenAI",
      data: {
        chunk: { content: "Test streaming response" },
      },
      metadata: { langgraph_node: "platform" },
    };
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
      OPENAI_API_KEY: "test-key",
      OPENAI_BASE_URL: "http://test-localai.liexp.test",
      LOCALAI_MAX_RETRIES: 3,
      LOCALAI_MODEL: "test-model",
      API_TOKEN: "my-token",
      API_BASE_URL: "http://api.liexp.test/v1",
      MCP_URL: "https://api.liexp.test/mcp",
      BRAVE_API_KEY: "null",
      SENTRY_DSN: null,
    },
    logger,
    jwt: GetJWTProvider({ secret: "test-secret", logger }),
    http: HTTPProvider(testAxios),
    puppeteer: ctxHelper.ctx<AgentContext["puppeteer"]>(
      GetPuppeteerProvider(
        ctxHelper.ctx<Parameters<typeof GetPuppeteerProvider>[0]>(puppeteerMock),
        { headless: "shell" },
        ctxHelper.ctx<Parameters<typeof GetPuppeteerProvider>[2]>(
          puppeteerMock.devices,
        ),
      ),
    ),
    langchain: ctxHelper.ctx<AgentContext["langchain"]>({}),
    fs: ctxHelper.ctx<AgentContext["fs"]>({
      getObject: (_path: string) => TE.right("# Mock AGENTS.md"),
    }),
    agentFactory: ctxHelper.ctx<AgentContext["agentFactory"]>(
      () => TE.right(createMockAgent()),
    ),
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
