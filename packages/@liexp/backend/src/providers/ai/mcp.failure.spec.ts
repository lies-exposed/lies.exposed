import { describe, expect, it, vi } from "vitest";
import { ServerError } from "../../errors/ServerError.js";
import {
  AgentMCPError,
  isRecoverableMcpFailure,
  loadMcpTools,
  MCP_INITIALIZATION_FAILED,
  MCP_TOOLS_UNAVAILABLE,
  tagMcpFailure,
  toMcpFailure,
} from "./mcp.failure.js";

const logger = () => ({ info: { log: vi.fn() }, warn: { log: vi.fn() } });

/** Reproduce the HOM-1599 / AGENT-1 chain: SdkHttpError nested in an
 *  MCPAdapter "Failed to load tools from server" error. */
const incidentError = (): Error => {
  const sdk = Object.assign(
    new Error(
      'Error POSTing to endpoint: {"jsonrpc":"2.0","error":{"code":-32000,"message":"Bad Request: Server not initialized"}}',
    ),
    { name: "SdkHttpError", status: 400 },
  );
  return Object.assign(
    new Error('Failed to load tools from server "api"', { cause: sdk }),
    {
      name: "MCPClientError",
      code: "CLIENT_HTTP_NOT_IMPLEMENTED",
      status: 400,
    },
  );
};

describe("isRecoverableMcpFailure", () => {
  it("classifies the HOM-1599 incident (Server not initialized / 400)", () => {
    expect(isRecoverableMcpFailure(incidentError())).toBe(true);
  });

  it("classifies transport-level failures as recoverable", () => {
    expect(isRecoverableMcpFailure(new Error("fetch failed"))).toBe(true);
    expect(
      isRecoverableMcpFailure(new Error("connect ECONNREFUSED 10.0.0.1:80")),
    ).toBe(true);
    expect(isRecoverableMcpFailure(new Error("read ECONNRESET"))).toBe(true);
  });

  it("classifies HTTP status carried on the error", () => {
    expect(
      isRecoverableMcpFailure(
        Object.assign(new Error("boom"), { status: 503 }),
      ),
    ).toBe(true);
    // A 401 auth rejection is not worth a reconnect churn.
    expect(isRecoverableMcpFailure(new Error("Unauthorized"))).toBe(false);
  });

  it("ignores unrelated agent errors", () => {
    expect(
      isRecoverableMcpFailure(new Error("No AI provider API keys configured")),
    ).toBe(false);
    expect(isRecoverableMcpFailure(null)).toBe(false);
    expect(isRecoverableMcpFailure("string failure")).toBe(false);
  });

  it("does not loop on a self-referencing cause chain", () => {
    const e = new Error("fetch failed");
    (e as Error & { cause?: unknown }).cause = e;
    expect(isRecoverableMcpFailure(e)).toBe(true);
  });
});

describe("AgentMCPError / toMcpFailure", () => {
  it("carries the typed code and marker properties for chat error mapping", () => {
    const err = toMcpFailure(MCP_TOOLS_UNAVAILABLE, incidentError());
    expect(err).toBeInstanceOf(ServerError);
    expect(err).toBeInstanceOf(AgentMCPError);
    expect(err.name).toBe("AgentMCPError");
    expect(err.code).toBe(MCP_TOOLS_UNAVAILABLE);
    expect(err.message).toBe("MCP tools unavailable");

    const typed = err.toTypedError();
    expect(typed.error_code).toBe(MCP_TOOLS_UNAVAILABLE);
    expect(typed.mcp_failure).toBe(true);
  });

  it("keeps the original error as cause and stack in meta", () => {
    const cause = incidentError();
    const err = toMcpFailure(MCP_TOOLS_UNAVAILABLE, cause);
    expect(err.cause).toBe(cause);
    expect(err.details.meta).toContain(MCP_TOOLS_UNAVAILABLE);
    expect(
      (err.details.meta ?? []).some((m) =>
        m.includes("Failed to load tools from server"),
      ),
    ).toBe(true);
  });

  it("is idempotent for an already typed failure", () => {
    const first = toMcpFailure(MCP_INITIALIZATION_FAILED, incidentError());
    expect(toMcpFailure(MCP_TOOLS_UNAVAILABLE, first)).toBe(first);
  });

  it("tagMcpFailure marks any mapped error without changing its type", () => {
    const tagged = tagMcpFailure(
      MCP_TOOLS_UNAVAILABLE,
      ServerError.fromUnknown(new Error("x")),
    );
    expect(tagged).toBeInstanceOf(ServerError);
    expect(tagged.error_code).toBe(MCP_TOOLS_UNAVAILABLE);
    expect(tagged.mcp_failure).toBe(true);
  });
});

describe("loadMcpTools", () => {
  it("returns tools directly when the session is healthy", async () => {
    const tools = [{ name: "api_tool" }];
    const client = {
      getTools: vi.fn().mockResolvedValue(tools),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const log = logger();

    const result = await loadMcpTools({ client: client as never, log });

    expect(result).toEqual({ ok: true, tools });
    expect(client.getTools).toHaveBeenCalledTimes(1);
    expect(client.close).not.toHaveBeenCalled();
  });

  it("retries with a fresh session on 'Server not initialized'", async () => {
    const tools = [{ name: "api_tool" }];
    const client = {
      getTools: vi
        .fn()
        .mockRejectedValueOnce(incidentError())
        .mockResolvedValueOnce(tools),
      close: vi.fn().mockResolvedValue(undefined),
    };
    const log = logger();

    const result = await loadMcpTools({ client: client as never, log });

    expect(result).toEqual({ ok: true, tools });
    // The dead session must be torn down before the retry, otherwise getTools()
    // replays against the dangling session id.
    expect(client.close).toHaveBeenCalledTimes(1);
    expect(client.getTools).toHaveBeenCalledTimes(2);
    expect(log.warn.log).toHaveBeenCalled();
  });

  it("reports a typed MCP_TOOLS_UNAVAILABLE failure when recovery fails", async () => {
    const client = {
      getTools: vi.fn().mockRejectedValue(incidentError()),
      close: vi.fn().mockResolvedValue(undefined),
    };

    const result = await loadMcpTools({
      client: client as never,
      log: logger(),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe(MCP_TOOLS_UNAVAILABLE);
    expect(result.error.toTypedError().error_code).toBe(MCP_TOOLS_UNAVAILABLE);
  });

  it("does not churn reconnects on a non-recoverable failure", async () => {
    const client = {
      getTools: vi.fn().mockRejectedValue(new Error("Unauthorized")),
      close: vi.fn().mockResolvedValue(undefined),
    };

    const result = await loadMcpTools({
      client: client as never,
      log: logger(),
    });

    expect(result.ok).toBe(false);
    expect(client.getTools).toHaveBeenCalledTimes(1);
    expect(client.close).not.toHaveBeenCalled();
  });

  it("still retries when session teardown itself throws", async () => {
    const tools = [{ name: "api_tool" }];
    const client = {
      getTools: vi
        .fn()
        .mockRejectedValueOnce(incidentError())
        .mockResolvedValueOnce(tools),
      close: vi.fn().mockRejectedValue(new Error("teardown failed")),
    };
    const log = logger();

    const result = await loadMcpTools({ client: client as never, log });

    expect(result).toEqual({ ok: true, tools });
    expect(log.warn.log).toHaveBeenCalled();
  });
});
