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
 * carry `lc_error_code` (e.g. MESSAGE_COERCION_FAILURE).
 */
export const getErrorCode = (error: unknown): string => {
  const code = (error as { lc_error_code?: unknown } | null)?.lc_error_code;
  return typeof code === "string" && code.length > 0 ? code : "UNKNOWN";
};

export const getErrorName = (error: unknown): string =>
  error instanceof Error ? error.name : typeof error;

/** Build an SSE `error` event carrying structured error fields. */
export const toChatErrorEvent = (
  error: unknown,
  fallbackMessage: string,
): ChatStreamEvent => ({
  type: "error",
  timestamp: new Date().toISOString(),
  error: error instanceof Error ? error.message : fallbackMessage,
  error_code: getErrorCode(error),
  error_name: getErrorName(error),
});

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
