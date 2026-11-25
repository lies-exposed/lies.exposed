import type { Logger } from "@liexp/core/lib/logger/Logger.js";
import type { ChatStreamEvent } from "@liexp/io/lib/http/Chat.js";
import type { Request, Response } from "express";
import * as E from "fp-ts/lib/Either.js";
import type { ZeroClawAdapter } from "./adapter.js";

// Well below the 60s activity timeout of the admin chat client.
export const KEEPALIVE_MS = 15_000;

/**
 * Answer a streaming chat request through ZeroClaw.
 *
 * ZeroClaw replies once, when the run ends, so the SSE stream carries
 * keepalive comments while waiting and then the whole reply. Closing the
 * connection cancels the run.
 */
export const streamZeroClawReply = async (
  zeroclaw: ZeroClawAdapter,
  req: Request,
  res: Response,
  logger: Logger,
  correlationId: string,
): Promise<void> => {
  const abortController = new AbortController();
  res.on("close", () => {
    abortController.abort();
  });

  // Skips writes after the client is gone, flushing past compression buffers.
  const write = (chunk: string): void => {
    if (res.writableEnded || res.destroyed) return;
    res.write(chunk);
    if ("flush" in res && typeof res.flush === "function") {
      res.flush();
    }
  };
  const send = (event: Omit<ChatStreamEvent, "timestamp">): void => {
    write(
      `data: ${JSON.stringify({ ...event, timestamp: new Date().toISOString() })}\n\n`,
    );
  };

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const messageId = crypto.randomUUID();
  send({ type: "message_start", message_id: messageId, role: "assistant" });

  const keepalive = setInterval(() => {
    write(": keepalive\n\n");
  }, KEEPALIVE_MS);

  const result = await zeroclaw.sendMessage(
    { message: req.body.message ?? "" },
    logger,
    abortController.signal,
  )();

  clearInterval(keepalive);

  if (E.isRight(result)) {
    const content = result.right.data.message;
    send({ type: "content_delta", message_id: messageId, content });
    send({ type: "message_end", message_id: messageId, content });
  } else {
    logger.error.log(
      "ZeroClaw streaming chat error: %O (correlation: %s)",
      result.left,
      correlationId,
    );
    send({
      type: "error",
      error: "Failed to process chat request via ZeroClaw",
    });
  }

  res.end();
};
