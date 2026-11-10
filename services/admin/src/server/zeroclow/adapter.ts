/**
 * ZeroClaw Webhook Adapter
 *
 * WS7 adapter that forwards chat messages to the ZeroClaw lies_exposed agent
 * via its Paperclip webhook endpoint, and returns responses in a format
 * compatible with the existing admin-proxy chat endpoints.
 *
 * ZeroClaw does not support streaming or conversation-list, so:
 * - Streaming is dropped (non-blocking HTTP call only)
 * - Conversation history is managed client-side by the admin frontend
 * - Each request is stateless (no conversation_id tracking)
 *
 * Flows that need events/media/areas/nations/socialposts stay on the old
 * agent service; this adapter only handles actor/group/link queries.
 */

import { pipe } from "@liexp/core/lib/fp/index.js";
import type { Logger } from "@liexp/core/lib/logger/Logger.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type { AdminProxyENV } from "../io/ENV.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape of a chat message request from the admin frontend */
export interface ChatRequest {
  message: string;
  conversation_id?: string | null;
  model?: string;
  aiConfig?: {
    provider?: string;
    model?: string;
  };
}

/** Shape of the response returned to the admin frontend */
export interface ChatResponse {
  data: {
    message: string;
    conversationId: string;
  };
}

/** ZeroClaw Paperclip heartbeat payload (minimal subset) */
interface ZeroClawPayload {
  runId: string;
  agentId: string;
  context: {
    taskId?: string;
    wakeReason: string;
    [key: string]: unknown;
  };
  env?: Record<string, string>;
  [key: string]: unknown;
}

/** ZeroClaw NDJSON stream frame */
interface ZeroClawFrame {
  type: string;
  content?: string;
  status?: string;
  result?: string;
  [key: string]: unknown;
}

/** ZeroClaw adapter interface */
export interface ZeroClawAdapter {
  agentId: string;
  webhookUrl: string;
  sendMessage: (
    req: ChatRequest,
    logger: Logger,
  ) => TE.TaskEither<Error, ChatResponse>;
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

/**
 * Create a ZeroClaw adapter from environment configuration.
 * Returns `Left(error)` if ZEROCLOW_WEBHOOK_URL is not configured but
 * ZEROCLOW_ENABLED is true.
 */
export const createZeroClawAdapter = (
  env: AdminProxyENV,
): TE.TaskEither<Error, ZeroClawAdapter> => {
  if (!env.ZEROCLOW_ENABLED) {
    return TE.left(
      new Error("ZEROCLOW_ENABLED is not set — ZeroClaw adapter is disabled"),
    );
  }

  const webhookUrl = env.ZEROCLOW_WEBHOOK_URL;
  const agentId = env.ZEROCLOW_AGENT_ID ?? "lies_exposed";

  if (!webhookUrl) {
    return TE.left(
      new Error(
        "ZEROCLOW_ENABLED is true but ZEROCLOW_WEBHOOK_URL is not configured",
      ),
    );
  }

  return TE.right({
    agentId,
    webhookUrl,
    sendMessage: createSendMessage(webhookUrl, agentId),
  });
};

/**
 * Create a sendMessage function bound to a specific webhook URL and agent ID.
 */
const createSendMessage =
  (webhookUrl: string, agentId: string) =>
  (req: ChatRequest, logger: Logger): TE.TaskEither<Error, ChatResponse> =>
    pipe(
      TE.tryCatch(
        () =>
          fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildPayload(req, agentId)),
            // ZeroClaw runs can take several minutes; allow up to 15 min.
            signal: AbortSignal.timeout(15 * 60 * 1000),
          }),
        (err) =>
          new Error(
            `ZeroClaw webhook request failed: ${(err as Error).message}`,
          ),
      ),
      TE.chain((res: Response) =>
        res.ok
          ? TE.right(res)
          : TE.left(new Error(`ZeroClaw webhook returned ${res.status}`)),
      ),
      TE.chain((res: Response) =>
        TE.tryCatch(
          async () => {
            const text = await res.text();
            const reply = parseNDJSON(text, logger);
            return {
              data: {
                message: reply,
                // ZeroClaw has no conversation model; return a placeholder.
                // The admin frontend manages conversation history client-side.
                conversationId: crypto.randomUUID(),
              },
            } as ChatResponse;
          },
          (err) =>
            new Error(
              `ZeroClaw response parsing failed: ${(err as Error).message}`,
            ),
        ),
      ),
      TE.orElse((err) =>
        TE.left(new Error(`ZeroClaw adapter error: ${(err as Error).message}`)),
      ),
    );

/**
 * Build a minimal Paperclip heartbeat payload from a chat request.
 *
 * The ZeroClaw adapter expects a `runId` and `agentId` at minimum. We
 * generate a synthetic runId and embed the chat message in the context
 * so the agent can process it.
 */
const buildPayload = (req: ChatRequest, _agentId: string): ZeroClawPayload => ({
  runId: crypto.randomUUID(),
  agentId: _agentId,
  context: {
    wakeReason: "manual_chat",
    taskId: crypto.randomUUID(),
    message: req.message,
  },
});

/**
 * Parse ZeroClaw NDJSON stream and extract the final reply.
 *
 * ZeroClaw sends frames like:
 *   {"type":"content","content":"hello"}
 *   {"type":"result","status":"success","result":"final answer"}
 *
 * We concatenate all `content` frames and fall back to `result` if present.
 */
const parseNDJSON = (body: string, logger: Logger): string => {
  const lines = body.split("\n").filter(Boolean);
  let reply = "";
  let lastResult: string | undefined;

  for (const line of lines) {
    try {
      const frame: ZeroClawFrame = JSON.parse(line);
      if (frame.type === "content" && frame.content) {
        reply += frame.content;
      }
      if (frame.type === "result" && frame.result) {
        lastResult = frame.result;
      }
    } catch {
      // Silently skip malformed frames
      logger.debug.log(
        "Skipping malformed ZeroClaw frame: %s",
        line.slice(0, 200),
      );
    }
  }

  // Prefer explicit result over concatenated content
  return lastResult ?? reply.trim();
};
