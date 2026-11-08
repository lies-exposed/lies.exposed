import type { ChatStreamEvent } from "@liexp/io/lib/http/Chat.js";
import * as Sentry from "@sentry/react";

export interface ChatErrorContext {
  conversationId?: string | null;
  provider?: string | null;
  model?: string | null;
  messageCount?: number;
}

const tagsAndExtras = (ctx: ChatErrorContext, errorCode: string) => ({
  tags: {
    feature: "ai-chat",
    error_code: errorCode,
    ...(ctx.provider ? { provider: ctx.provider } : {}),
    ...(ctx.model ? { model: ctx.model } : {}),
  },
  extra: {
    conversation_id: ctx.conversationId ?? null,
    message_count: ctx.messageCount ?? null,
  },
});

/** Report an SSE `error` event received from the agent stream. */
export const reportChatStreamError = (
  event: ChatStreamEvent,
  ctx: ChatErrorContext,
): void => {
  const errorCode = event.error_code ?? "UNKNOWN";
  const error = new Error(event.error ?? "Unknown chat stream error");
  error.name = event.error_name ?? "ChatStreamError";
  Sentry.captureException(error, {
    ...tagsAndExtras(ctx, errorCode),
    fingerprint: ["ai-chat", "stream", errorCode, error.name],
  });
};

/** Report a non-benign client-side failure while sending a chat message. */
export const reportChatClientError = (
  error: unknown,
  ctx: ChatErrorContext,
): void => {
  Sentry.captureException(error, {
    ...tagsAndExtras(ctx, "CLIENT"),
    fingerprint: [
      "ai-chat",
      "client",
      error instanceof Error ? error.name : "unknown",
    ],
  });
};
