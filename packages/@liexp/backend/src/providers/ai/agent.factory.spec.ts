import path from "path";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { describe, expect, it, vi } from "vitest";
import { GetAgentFactory } from "./agent.factory.js";
import { MCP_TOOLS_UNAVAILABLE } from "./mcp.failure.js";

vi.mock("./tools/webScraping.tools.js", () => ({
  createWebScrapingTool: (): StructuredToolInterface =>
    ({ name: "web_scraping" }) as unknown as StructuredToolInterface,
}));
vi.mock("./tools/searchWeb.tools.js", () => ({
  createSearchWebTool: (): StructuredToolInterface =>
    ({ name: "search_web" }) as unknown as StructuredToolInterface,
}));
vi.mock("./tools/readDocumentation.tool.js", () => ({
  createReadDocumentationTool: (): StructuredToolInterface =>
    ({ name: "read_docs" }) as unknown as StructuredToolInterface,
}));
vi.mock("./langchain.provider.js", () => ({
  GetLangchainProvider: () => ({
    chat: { name: "fake-chat-model" },
    embeddings: {},
    options: { apiKey: "k", models: { chat: "m" } },
  }),
}));
const captured = vi.hoisted(() => ({ tools: [] as unknown[] }));

vi.mock("langchain", () => ({
  createAgent: vi.fn((opts: { tools?: unknown[] }) => {
    captured.tools = opts?.tools ?? [];
    return { name: "fake-agent", tools: captured.tools };
  }),
}));
vi.mock("@langchain/langgraph", () => ({ MemorySaver: class {} }));

const logger = () => ({
  info: { log: vi.fn() },
  debug: { log: vi.fn() },
  warn: { log: vi.fn() },
  error: { log: vi.fn() },
});

const toolNamesOf = (): string[] =>
  captured.tools.map((t) => (t as { name: string }).name);

/** MCPAdapter surface actually used by the factory. */
const fakeMcp = (overrides: Record<string, unknown> = {}) => ({
  getTools: vi
    .fn()
    .mockResolvedValue([
      { name: "api_event_search" },
      { name: "api_actor_get" },
    ]),
  close: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const buildContext = () => ({
  logger: logger(),
  fs: { getObject: () => () => Promise.resolve("# prompt") },
  langchain: {
    options: {
      apiKey: "test-key",
      baseURL: "http://localhost",
      maxRetries: 1,
      provider: "openai",
      models: { chat: "gpt-4o", embeddings: "emb" },
      options: { chat: {}, embeddings: {} },
    },
    chat: {},
    embeddings: {},
  },
  puppeteer: {},
  brave: {},
});

const skillsDir = path.resolve(
  process.cwd(),
  "src/providers/ai/__fixtures__/skills",
);

describe("GetAgentFactory — MCP tool load & failure mapping", () => {
  it("includes MCP tools when the session is healthy", async () => {
    const client = fakeMcp();
    const onMcpDegraded = vi.fn();
    const createAgent = GetAgentFactory({
      mcpClient: client as never,
      skillsDir,
      onMcpDegraded,
    })(buildContext() as never);

    const result = await createAgent("platform")();
    expect(result._tag).toBe("Right");
    if (result._tag === "Left") return;

    const names = toolNamesOf();
    expect(names).toContain("api_event_search");
    expect(names).toContain("search_web");
    expect(client.getTools).toHaveBeenCalledTimes(1);
    expect(onMcpDegraded).not.toHaveBeenCalled();
  });

  it("degrades to non-MCP tools instead of failing the chat turn", async () => {
    const failure = Object.assign(
      new Error('Failed to load tools from server "api"', {
        cause: Object.assign(
          new Error(
            'Error POSTing to endpoint: {"jsonrpc":"2.0","error":{"code":-32000,"message":"Bad Request: Server not initialized"}}',
          ),
          { name: "SdkHttpError", status: 400 },
        ),
      }),
      {
        name: "MCPClientError",
        code: "CLIENT_HTTP_NOT_IMPLEMENTED",
        status: 400,
      },
    );
    const client = fakeMcp({ getTools: vi.fn().mockRejectedValue(failure) });
    const onMcpDegraded = vi.fn();

    const createAgent = GetAgentFactory({
      mcpClient: client as never,
      skillsDir,
      onMcpDegraded,
    })(buildContext() as never);

    const result = await createAgent("platform")();
    // Previously this whole request failed with error_code=UNKNOWN.
    expect(result._tag).toBe("Right");
    if (result._tag === "Left") return;

    const names = toolNamesOf();
    expect(names).not.toContain("api_event_search");
    expect(names).toContain("search_web");
    expect(names).toContain("web_scraping");

    // Fresh-session recovery: dead session torn down before retrying.
    expect(client.close).toHaveBeenCalledTimes(1);
    expect(client.getTools).toHaveBeenCalledTimes(2);

    // Typed failure code reported for error mapping (not UNKNOWN).
    expect(onMcpDegraded).toHaveBeenCalledTimes(1);
    const reported = onMcpDegraded.mock.calls[0][0] as {
      code: string;
      toTypedError: () => { error_code?: string };
    };
    expect(reported.code).toBe(MCP_TOOLS_UNAVAILABLE);
    expect(reported.toTypedError().error_code).toBe(MCP_TOOLS_UNAVAILABLE);
  });

  it("does not cache a degraded tool set — retries MCP on the next request", async () => {
    const failure = Object.assign(
      new Error(
        'Failed to load tools from server "api": Server not initialized',
      ),
      { name: "MCPClientError", status: 400 },
    );
    const client = fakeMcp({
      getTools: vi
        .fn()
        .mockRejectedValueOnce(failure)
        .mockRejectedValueOnce(failure)
        .mockRejectedValueOnce(failure)
        .mockRejectedValueOnce(failure)
        .mockResolvedValueOnce([{ name: "api_event_search" }]),
    });

    const createAgent = GetAgentFactory({
      mcpClient: client as never,
      skillsDir,
      mcpRetryCooldownMs: 0,
    })(buildContext() as never);

    const degraded = await createAgent("platform")();
    if (degraded._tag === "Left") throw new Error("expected degraded right");
    expect(toolNamesOf()).not.toContain("api_event_search");

    // Second request: still degraded, but the factory must re-attempt (cooldown 0ms).
    const second = await createAgent("platform")();
    if (second._tag === "Left") throw new Error("expected degraded right");
    expect(toolNamesOf()).not.toContain("api_event_search");

    // Third request: MCP recovered — the cached-degradation bug would have kept
    // serving an MCP-less agent here forever.
    const third = await createAgent("platform")();
    if (third._tag === "Left") throw new Error("expected recovered right");
    expect(toolNamesOf()).toContain("api_event_search");
    // Requests 1 and 2 each burned 2 attempts (initial + fresh-session retry);
    // request 3 recovered on its first attempt. Total: 5.
    expect(client.getTools).toHaveBeenCalledTimes(5);
  });

  it("holds an MCP re-handshake cooldown while degraded", async () => {
    const failure = Object.assign(new Error("Server not initialized"), {
      name: "MCPClientError",
      status: 400,
    });
    const client = fakeMcp({ getTools: vi.fn().mockRejectedValue(failure) });

    const createAgent = GetAgentFactory({
      mcpClient: client as never,
      skillsDir,
      mcpRetryCooldownMs: 60_000,
    })(buildContext() as never);

    await createAgent("platform")();
    expect(client.getTools).toHaveBeenCalledTimes(2);

    // While the endpoint is known-down, later requests must not each burn the
    // full reconnect budget.
    await createAgent("platform")();
    await createAgent("platform")();
    expect(client.getTools).toHaveBeenCalledTimes(2);
  });

  it("researcher agent never touches the MCP client", async () => {
    const client = fakeMcp();
    const createAgent = GetAgentFactory({
      mcpClient: client as never,
      skillsDir,
    })(buildContext() as never);

    const result = await createAgent("researcher")();
    if (result._tag === "Left") throw new Error("unexpected left");
    expect(toolNamesOf()).not.toContain("api_event_search");
    expect(client.getTools).not.toHaveBeenCalled();
  });

  it("reports degraded MCP without failing when the client is null", async () => {
    const onMcpDegraded = vi.fn();
    const createAgent = GetAgentFactory({
      mcpClient: null,
      skillsDir,
      onMcpDegraded,
    })(buildContext() as never);

    const result = await createAgent("platform")();
    expect(result._tag).toBe("Right");
    expect(onMcpDegraded).not.toHaveBeenCalled();
  });
});
