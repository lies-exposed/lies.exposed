import { type MCPAdapter } from "@langchain/mcp-adapters";
import { ServerError } from "../../errors/ServerError.js";

/**
 * MCP transport/session failures are a distinct fault class from generic agent
 * errors: the api `/mcp` endpoint rejected the session ("Server not
 * initialized" / CLIENT_HTTP_NOT_IMPLEMENTED), or the api is simply
 * unreachable. Bugsink fingerprinted every one of them as `UNKNOWN`, which
 * grouped them with unrelated chat failures (see HOM-1599 / AGENT-1, ADMIN-3).
 *
 * These codes travel as the `error_code` property so:
 *   - `getErrorCode` in services/agent carries it into the SSE `error` event
 *     and the Sentry tag/fingerprint, and
 *   - admin UI stops reporting `error_code=UNKNOWN` for agent-side MCP faults.
 */
export const MCP_TOOLS_UNAVAILABLE = "MCP_TOOLS_UNAVAILABLE";
export const MCP_INITIALIZATION_FAILED = "MCP_INITIALIZATION_FAILED";

/** Errors carrying a machine-readable code consumed by chat error mapping. */
export interface McpFailureMarkers {
  error_code?: string;
  mcp_failure?: true;
}

const MESSAGES: Record<string, string> = {
  [MCP_TOOLS_UNAVAILABLE]: "MCP tools unavailable",
  [MCP_INITIALIZATION_FAILED]: "MCP initialization failed",
};

const asText = (v: unknown): string => {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint")
    return String(v);
  return "";
};

/**
 * Agent-side MCP error. Extends `ServerError` so every existing consumer
 * (HTTP mapping, `TE.orElse`, logging) keeps working unchanged while the typed
 * markers ride along.
 */
export class AgentMCPError extends ServerError {
  readonly code: string;
  readonly cause: unknown;

  constructor(code: string, message?: string, cause?: unknown) {
    super(message ?? MESSAGES[code] ?? "MCP failure", {
      kind: "ServerError",
      status: "500",
      meta: [code, asText(cause instanceof Error ? cause.stack : cause)],
    });
    this.name = "AgentMCPError";
    this.code = code;
    this.cause = cause;
  }

  toTypedError(): Error {
    return Object.assign(this, {
      error_code: this.code,
      mcp_failure: true as const,
    });
  }
}

/** Attach the typed MCP markers to any (already mapped) error. */
export const tagMcpFailure = <E extends Error>(
  code: string,
  error: E,
): E & McpFailureMarkers =>
  Object.assign(error, { error_code: code, mcp_failure: true as const });

/**
 * The MCP streamable-HTTP handshake is a POST initialize; the api answers 400
 * with JSON-RPC -32000 "Bad Request: Server not initialized" when the session
 * is missing/expired. `@modelcontextprotocol/sdk` surfaces that as an
 * SdkHttpError and the adapter as MCPClientError
 * (code CLIENT_HTTP_NOT_IMPLEMENTED, status 400) from its GET/POST fallback
 * probe. All of those are recoverable with a fresh session; anything else
 * (auth rejection, other 5xx) is not worth a reconnect churn.
 */
const RECOVERABLE_PATTERNS: RegExp[] = [
  /server not initialized/i,
  /mcp session not initialized/i,
  /session/i,
  /not found/i,
  /bad request/i,
  /client_http_not_implemented/i,
  /\bECONNREFUSED\b/,
  /\bECONNRESET\b/,
  /\bETIMEDOUT\b/,
  /fetch failed/i,
];

const collectMarkers = (error: unknown): string[] => {
  const texts: string[] = [];
  const seen = new Set<unknown>();
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current != null; depth += 1) {
    if (seen.has(current)) break;
    seen.add(current);
    if (current instanceof Error) {
      texts.push(`${current.name}: ${current.message}`);
      const own = current as Error & { code?: unknown; status?: unknown };
      texts.push(asText(own.code));
      texts.push(`status ${asText(own.status)}`);
      current = (current as { cause?: unknown }).cause;
    } else {
      texts.push(asText(current));
      break;
    }
  }
  return texts;
};

export const isRecoverableMcpFailure = (error: unknown): boolean => {
  const texts = collectMarkers(error);
  if (texts.some((t) => /\bstatus 40[01]\b/.test(t))) return true;
  if (texts.some((t) => /\bstatus 5\d\d\b/.test(t))) return true;
  return texts.some((t) => RECOVERABLE_PATTERNS.some((re) => re.test(t)));
};

/** Map any MCP failure to a typed `AgentMCPError`. */
export const toMcpFailure = (code: string, error: unknown): AgentMCPError =>
  error instanceof AgentMCPError
    ? error
    : new AgentMCPError(code, undefined, error);

export interface LoadMcpToolsOptions {
  client: MCPAdapter;
  log: {
    info: { log: (msg: string, ...args: unknown[]) => void };
    warn: { log: (msg: string, ...args: unknown[]) => void };
  };
  /** Close + re-handshake before the retry attempt. Default true. */
  closeAndRetry?: boolean;
}

/**
 * Load MCP tools with a fresh-session recovery step.
 *
 * The adapter caches connection state per server; `getTools()` on a dangling
 * session keeps replaying against the dead session id (and its own bounded
 * reconnect loop, maxAttempts 5 / fixed 10s, had already burned through in the
 * HOM-1599 incident window). `close()` tears down every connection and clears
 * the discovery caches while leaving the adapter usable — the next
 * `getTools()` re-handshakes from scratch instead of resurrecting the dead one.
 */
export const loadMcpTools = async (
  opts: LoadMcpToolsOptions,
): Promise<
  | { ok: true; tools: Awaited<ReturnType<MCPAdapter["getTools"]>> }
  | { ok: false; error: AgentMCPError }
> => {
  const closeAndRetry = opts.closeAndRetry ?? true;

  try {
    return { ok: true, tools: await opts.client.getTools() };
  } catch (first) {
    if (!isRecoverableMcpFailure(first)) {
      return { ok: false, error: toMcpFailure(MCP_TOOLS_UNAVAILABLE, first) };
    }

    opts.log.warn.log(
      "MCP tool load failed (%s); retrying with a fresh MCP session",
      first instanceof Error ? asText(first.message) : asText(first),
    );

    if (closeAndRetry) {
      try {
        await opts.client.close();
      } catch (closeErr) {
        opts.log.warn.log(
          "MCP session teardown failed: %s",
          closeErr instanceof Error
            ? asText(closeErr.message)
            : asText(closeErr),
        );
      }
    }

    try {
      const tools = await opts.client.getTools();
      opts.log.info.log("MCP tool load succeeded after fresh-session retry");
      return { ok: true, tools };
    } catch (second) {
      return { ok: false, error: toMcpFailure(MCP_TOOLS_UNAVAILABLE, second) };
    }
  }
};
