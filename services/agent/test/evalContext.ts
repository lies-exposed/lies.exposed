import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GetAgentFactory } from "@liexp/backend/lib/providers/ai/agent.factory.js";
import { type AgentProvider } from "@liexp/backend/lib/providers/ai/agent.provider.js";
import { GetLangchainProvider } from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { GetBraveProvider } from "@liexp/backend/lib/providers/brave.provider.js";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import * as logger from "@liexp/core/lib/logger/index.js";
import { type AvailableModels } from "@liexp/io/lib/http/Chat.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import axios from "axios";
import { BraveSearch } from "brave-search";
import * as puppeteer from "puppeteer-core";
import { type VanillaPuppeteer } from "puppeteer-extra";
import { type AgentContext } from "../src/context/context.type.js";
import { createCliExecutorTool } from "../src/tools/cli-executor.tool.js";
import { makeDebugFetch, makeReplayFetch } from "./evalDebug.js";

/**
 * Creates a real AgentContext for eval tests using .env.local credentials.
 *
 * Differences from production `makeAgentContext`:
 * - MCP client is omitted (skips connection overhead; CLI tool still works)
 * - Agent factory pre-creates a default platform agent for ctx.agent.agent
 */
// Resolve service root from this file's location so paths are correct
// regardless of where vitest is invoked from.
const SERVICE_ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");

export const loadEvalContext = async (): Promise<AgentContext> => {
  const evalLogger = logger.GetLogger("agent-eval");

  const provider = (process.env.AI_PROVIDER ?? "openai") as
    | "openai"
    | "anthropic"
    | "xai";
  const model = (process.env.LOCALAI_MODEL ?? "qwen_qwen3.5-2b") as AvailableModels;
  
  console.log(`[EVAL] Using AI provider: ${provider}, model: ${model}`);
  const apiKey =
    provider === "anthropic"
      ? process.env.ANTHROPIC_API_KEY!
      : provider === "xai"
        ? process.env.XAI_API_KEY!
        : process.env.OPENAI_API_KEY!;
  const baseURL =
    provider === "openai" ? process.env.OPENAI_BASE_URL : undefined;

  const langchain = GetLangchainProvider({
    provider,
    apiKey,
    baseURL: baseURL!,
    maxRetries: 0,
    models: { chat: model, embeddings: model },
    // maxRetries: 0 here sets both the OpenAI SDK client retry (via configuration)
    // and the LangChain ChatOpenAI wrapper retry — eval tests must fail fast.
    options: {
      chat: {
        maxRetries: 0,
        configuration: {
          // DEBUG_EVAL=1  → record real traffic to .eval-debug/http/
          // REPLAY_EVAL=1 → replay recorded fixtures, no real LLM calls
          fetch: process.env.REPLAY_EVAL
            ? makeReplayFetch()
            : process.env.DEBUG_EVAL
              ? makeDebugFetch()
              : undefined,
        },
      },
      embeddings: {},
    },
  });

  const http = HTTPProvider(axios.create({}));
  const jwt = GetJWTProvider({
    secret: process.env.JWT_SECRET ?? "eval-secret",
    logger: evalLogger,
  });
  const puppeteerProvider = GetPuppeteerProvider(
    puppeteer as any as VanillaPuppeteer,
    { headless: "shell" },
    puppeteer.KnownDevices,
  );
  const braveProvider = GetBraveProvider(
    new BraveSearch(process.env.BRAVE_API_KEY ?? ""),
  );
  const rawFsClient = GetFSClient({ client: fs });
  // agent.factory.ts resolves prompt files with process.cwd() which is the
  // monorepo root when running via `pnpm --filter`. Override getObject so
  // relative-looking paths (produced by path.resolve(cwd, "AGENTS.md")) that
  // don't point to the service root are re-resolved from SERVICE_ROOT.
  const fsClient: typeof rawFsClient = {
    ...rawFsClient,
    getObject: (filePath: string) => {
      const corrected = filePath.startsWith(SERVICE_ROOT)
        ? filePath
        : path.resolve(SERVICE_ROOT, path.basename(filePath));
      return rawFsClient.getObject(corrected);
    },
  };

  const cliTool = createCliExecutorTool(
    path.resolve(SERVICE_ROOT, "src/cli/cli.ts"),
  );

  // Factory context includes brave (required by GetAgentFactory) even though
  // AgentContext itself doesn't expose it as a top-level field.
  const factoryCtx = {
    langchain,
    logger: evalLogger,
    puppeteer: puppeteerProvider,
    brave: braveProvider,
    fs: fsClient,
  };

  const agentFactory = GetAgentFactory({
    mcpClient: null,
    cliTool,
    apiKeys: {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      xai: process.env.XAI_API_KEY,
    },
  })(factoryCtx);

  // Pre-create a default auto agent for ctx.agent.agent (routes to multi-agent graph)
  const defaultAgent = await throwTE(agentFactory("auto"));

  const agentProvider: AgentProvider = {
    agent: defaultAgent,
    tools: [],
    createAgent: () => defaultAgent,
    invoke: () => {
      throw new Error("use sendChatMessageStream in eval tests");
    },
    stream: () => {
      throw new Error("use sendChatMessageStream in eval tests");
    },
  };

  return {
    env: {
      NODE_ENV: "test",
      SERVER_HOST: "localhost",
      SERVER_PORT: 4000,
      JWT_SECRET: process.env.JWT_SECRET ?? "eval-secret",
      DEBUG: process.env.DEBUG ?? "-",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_BASE_URL: process.env.OPENAI_BASE_URL ?? "",
      LOCALAI_MAX_RETRIES: 1,
      API_TOKEN: process.env.API_TOKEN ?? "",
      API_BASE_URL: process.env.API_BASE_URL ?? "",
      MCP_URL: process.env.MCP_URL ?? "",
      BRAVE_API_KEY: process.env.BRAVE_API_KEY ?? "",
      SENTRY_DSN: null,
    } as any,
    logger: evalLogger,
    jwt,
    http,
    langchain,
    puppeteer: puppeteerProvider,
    fs: fsClient,
    agent: agentProvider,
    agentFactory,
  };
};
