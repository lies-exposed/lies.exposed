import { Sentry } from "@liexp/backend/lib/providers/sentry.provider.js";
import { type ChatStreamEvent } from "@liexp/io/lib/http/Chat.js";
import { type AgentContext } from "../../context/context.type.js";

export interface ChatErrorMeta {
  conversationId?: string | null;
  agentType?: string | null;
  provider?: string | null;
  model?: string | null;
  messageLength?: number;
}

/**
 * Extract a machine-readable code from an unknown error. LangChain errors
 * carry `lc_error_code` (e.g. MESSAGE_COERCION_FAILURE). MCP transport/session
 * failures carry our own typed `error_code` (e.g. MCP_TOOLS_UNAVAILABLE, set by
 * AgentMCPError/toMcpFailure in @liexp/backend) so Bugsink fingerprints the
 * outage separately instead of lumping it under UNKNOWN (HOM-1599).
 */
export const getErrorCode = (error: unknown): string => {
  const tagged = (error as { error_code?: unknown } | null)?.error_code;
  if (typeof tagged === "string" && tagged.length > 0) return tagged;
  const code = (error as { lc_error_code?: unknown } | null)?.lc_error_code;
  return typeof code === "string" && code.length > 0 ? code : "UNKNOWN";
};

const getErrorName = (error: unknown): string =>
  error instanceof Error ? error.name : typeof error;

/**
 * LangGraph aborts a run with `GraphRecursionError` (lc_error_code
 * GRAPH_RECURSION_LIMIT) when the agent loop exceeds `recursionLimit` steps —
 * i.e. the model kept calling tools without ever producing a final answer.
 */
const isRecursionLimitError = (error: unknown): boolean =>
  getErrorCode(error) === "GRAPH_RECURSION_LIMIT" ||
  getErrorName(error) === "GraphRecursionError";

const RECURSION_LIMIT_MESSAGE =
  "The agent reached its step limit before producing an answer (it kept calling tools). " +
  'Its progress so far is kept — reply "continue" to resume, or narrow the request.';

/** Build an SSE `error` event carrying structured error fields. */
export const toChatErrorEvent = (
  error: unknown,
  fallbackMessage: string,
): ChatStreamEvent => {
  const recursion = isRecursionLimitError(error);
  return {
    type: "error",
    timestamp: new Date().toISOString(),
    error: recursion
      ? RECURSION_LIMIT_MESSAGE
      : error instanceof Error
        ? error.message
        : fallbackMessage,
    error_code: recursion ? "GRAPH_RECURSION_LIMIT" : getErrorCode(error),
    error_name: getErrorName(error),
  };
};

/**
 * Report a chat error to Sentry. Never includes message text, API keys or
 * aiConfig secrets — only identifiers and sizes.
 */
export const captureChatError = (
  _ctx: AgentContext,
  error: unknown,
  meta: ChatErrorMeta,
): void => {
  if (!Sentry.isInitialized()) return;
  const errorCode = getErrorCode(error);
  Sentry.captureException(error, {
    tags: {
      feature: "ai-chat",
      error_code: errorCode,
      ...(meta.provider ? { provider: meta.provider } : {}),
      ...(meta.model ? { model: meta.model } : {}),
      ...(meta.agentType ? { agent_type: meta.agentType } : {}),
    },
    extra: {
      conversation_id: meta.conversationId ?? null,
      message_length: meta.messageLength ?? null,
    },
    fingerprint: ["ai-chat", errorCode, getErrorName(error)],
  });
};

/**
 * Report an MCP outage the agent degraded around (HOM-1599): the tool load
 * failed even after a fresh-session retry, so the chat turn continued on the
 * non-MCP tools instead of erroring. Reported as its own event — fingerprinted
 * `mcp-degraded` + the typed code — so it keeps showing up in Bugsink without
 * being masked by the removed failure event or grouped with generic
 * `UNKNOWN` agent failures.
 */
export const captureMcpDegraded = (
  error: unknown,
  meta: ChatErrorMeta,
): void => {
  if (!Sentry.isInitialized()) return;
  const errorCode = getErrorCode(error);
  Sentry.captureException(error, {
    tags: {
      feature: "ai-chat",
      error_code: errorCode,
      failure_kind: "mcp-degraded",
      ...(meta.agentType ? { agent_type: meta.agentType } : {}),
    },
    extra: { conversation_id: meta.conversationId ?? null },
    fingerprint: ["ai-chat", "mcp-degraded", errorCode],
  });
};
