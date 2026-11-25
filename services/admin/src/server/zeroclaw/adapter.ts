/**
 * ZeroClaw Webhook Adapter
 *
 * WS7 adapter that forwards chat messages to the ZeroClaw lies_exposed agent
 * via its Paperclip webhook endpoint, and returns responses in a format
 * compatible with the existing admin-proxy chat endpoints.
 *
 * ZeroClaw does not support token streaming or conversation-list, so:
 * - The reply arrives in one piece when the run ends (see ./stream.ts)
 * - Conversation history is managed client-side by the admin frontend
 * - Each request is stateless (no conversation_id tracking)
 *
 * Flows that need events/media/areas/nations/socialposts stay on the old
 * agent service; this adapter only handles actor/group/link queries.
 */

import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { pipe } from "@liexp/core/lib/fp/index.js";
import type { Logger } from "@liexp/core/lib/logger/Logger.js";
import * as E from "fp-ts/lib/Either.js";
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
  /** ZeroClaw agent alias; the webhook falls back to its default agent without it */
  model: string;
  context: {
    wakeReason: string;
    [key: string]: unknown;
  };
  env?: Record<string, string>;
  [key: string]: unknown;
}

/** ZeroClaw NDJSON stream frame */
interface ZeroClawFrame {
  type: string;
  status?: string;
  result?: string;
  error?: string;
  errorCode?: string;
  [key: string]: unknown;
}

/** ZeroClaw adapter interface */
export interface ZeroClawAdapter {
  agentId: string;
  webhookUrl: string;
  sendMessage: (
    req: ChatRequest,
    logger: Logger,
    signal?: AbortSignal,
  ) => TE.TaskEither<Error, ChatResponse>;
}

// ---------------------------------------------------------------------------
// Adapter
// ---------------------------------------------------------------------------

/**
 * Create a ZeroClaw adapter from environment configuration.
 * Returns `Left(error)` if ZEROCLAW_WEBHOOK_URL is not configured but
 * ZEROCLAW_ENABLED is true.
 */
export const createZeroClawAdapter = (
  env: AdminProxyENV,
): TE.TaskEither<Error, ZeroClawAdapter> => {
  if (!env.ZEROCLAW_ENABLED) {
    return TE.left(
      new Error("ZEROCLAW_ENABLED is not set — ZeroClaw adapter is disabled"),
    );
  }

  const webhookUrl = env.ZEROCLAW_WEBHOOK_URL;
  const agentId = env.ZEROCLAW_AGENT_ID ?? "lies_exposed";

  if (!webhookUrl) {
    return TE.left(
      new Error(
        "ZEROCLAW_ENABLED is true but ZEROCLAW_WEBHOOK_URL is not configured",
      ),
    );
  }

  return TE.right({
    agentId,
    webhookUrl,
    sendMessage: createSendMessage(webhookUrl, agentId),
  });
};

// ZeroClaw runs can take several minutes; allow up to 15 min.
const RUN_TIMEOUT_MS = 15 * 60 * 1000;

interface WebhookReply {
  status: number;
  body: string;
}

/**
 * POST a JSON body and buffer the whole reply.
 *
 * Uses `node:http` instead of `fetch`: the webhook stays silent while the agent
 * works, and `fetch` drops connections that are idle for 5 minutes.
 */
const postJSON = (
  url: string,
  body: string,
  signal: AbortSignal,
): Promise<WebhookReply> =>
  new Promise((resolve, reject) => {
    const request = url.startsWith("https:") ? httpsRequest : httpRequest;
    const req = request(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
      },
      (res) => {
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (chunk: string) => {
          text += chunk;
        });
        res.on("end", () => {
          resolve({ status: res.statusCode ?? 0, body: text });
        });
        res.on("error", reject);
      },
    );
    req.on("error", reject);
    req.end(body);
  });

/**
 * Create a sendMessage function bound to a specific webhook URL and agent ID.
 */
const createSendMessage =
  (webhookUrl: string, agentId: string) =>
  (
    req: ChatRequest,
    logger: Logger,
    signal?: AbortSignal,
  ): TE.TaskEither<Error, ChatResponse> =>
    pipe(
      TE.tryCatch(
        () => {
          const timeout = AbortSignal.timeout(RUN_TIMEOUT_MS);
          return postJSON(
            webhookUrl,
            JSON.stringify(buildPayload(req, agentId)),
            signal ? AbortSignal.any([signal, timeout]) : timeout,
          );
        },
        (err) =>
          new Error(
            `ZeroClaw webhook request failed: ${(err as Error).message}`,
          ),
      ),
      TE.chain((res) =>
        res.status >= 200 && res.status < 300
          ? TE.right(res)
          : TE.left(new Error(`ZeroClaw webhook returned ${res.status}`)),
      ),
      TE.chainEitherK((res) => parseNDJSON(res.body, logger)),
      TE.map((reply): ChatResponse => ({
        data: {
          message: reply,
          // ZeroClaw has no conversation model; return a placeholder.
          // The admin frontend manages conversation history client-side.
          conversationId: crypto.randomUUID(),
        },
      })),
      TE.mapLeft((err) => new Error(`ZeroClaw adapter error: ${err.message}`)),
    );

/**
 * Build a minimal Paperclip heartbeat payload from a chat request.
 *
 * `model` selects the ZeroClaw agent. It comes from configuration only, never
 * from the request, so chat users cannot pick another agent. No `taskId` is
 * sent: the webhook treats it as a Paperclip issue id.
 */
const buildPayload = (req: ChatRequest, agentId: string): ZeroClawPayload => ({
  runId: crypto.randomUUID(),
  agentId,
  model: agentId,
  context: {
    wakeReason: "manual_chat",
    message: req.message,
  },
});

/**
 * Parse ZeroClaw NDJSON stream and extract the final reply.
 *
 * ZeroClaw sends frames like:
 *   {"type":"started","queuedMs":0}
 *   {"type":"stdout","chunk":"hello"}
 *   {"type":"result","status":"completed","result":"final answer"}
 *
 * The terminal `result` frame is authoritative: anything but `completed`, or a
 * stream that ends without it, is a failed run.
 */
const parseNDJSON = (body: string, logger: Logger): E.Either<Error, string> => {
  const lines = body.split("\n").filter(Boolean);

  for (const line of lines) {
    try {
      const frame: ZeroClawFrame = JSON.parse(line);
      if (frame.type !== "result") continue;

      if (frame.status !== "completed") {
        return E.left(
          new Error(
            `ZeroClaw run ${frame.status ?? "failed"}: ${frame.error ?? frame.errorCode ?? "no details"}`,
          ),
        );
      }

      return frame.result
        ? E.right(frame.result)
        : E.left(new Error("ZeroClaw run completed with an empty reply"));
    } catch {
      // Silently skip malformed frames
      logger.debug.log(
        "Skipping malformed ZeroClaw frame: %s",
        line.slice(0, 200),
      );
    }
  }

  return E.left(new Error("ZeroClaw stream ended without a result frame"));
};
