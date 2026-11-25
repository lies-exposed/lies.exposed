// @vitest-environment node
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { Logger } from "@liexp/core/lib/logger/Logger.js";
import { Schema } from "effect";
import type { Request, Response } from "express";
import * as E from "fp-ts/lib/Either.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminProxyENV } from "../io/ENV.js";
import { createZeroClawAdapter } from "./adapter.js";
import { streamZeroClawReply } from "./stream.js";

const log = { log: vi.fn() };
const logger = {
  debug: log,
  info: log,
  warn: log,
  error: log,
} as unknown as Logger;

let server: Server | undefined;

afterEach(() => {
  server?.close();
  server = undefined;
});

/** Serve the given NDJSON frames and record the request bodies. */
const startWebhook = async (frames: object[], status = 200) => {
  const bodies: Record<string, unknown>[] = [];
  const authorizations: (string | undefined)[] = [];
  server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      authorizations.push(req.headers.authorization);
      bodies.push(JSON.parse(body));
      res.statusCode = status;
      res.end(frames.map((f) => JSON.stringify(f)).join("\n"));
    });
  });
  await new Promise<void>((resolve) => server!.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}/paperclip/heartbeat`,
    bodies,
    authorizations,
  };
};

const makeAdapter = async (url: string, token?: string) => {
  const result = await createZeroClawAdapter({
    ZEROCLAW_ENABLED: true,
    ZEROCLAW_WEBHOOK_URL: url,
    ZEROCLAW_WEBHOOK_TOKEN: token,
  } as Parameters<typeof createZeroClawAdapter>[0])();
  if (E.isLeft(result)) throw result.left;
  return result.right;
};

const completed = [
  { type: "started", queuedMs: 0 },
  { type: "stdout", chunk: "partial" },
  { type: "result", status: "completed", result: "final answer" },
];

describe("AdminProxyENV ZEROCLAW_ENABLED", () => {
  it.each([
    ["true", true],
    ["false", false],
  ])("decodes %s", (input, expected) => {
    const schema = Schema.Struct({
      value: AdminProxyENV.fields.ZEROCLAW_ENABLED,
    });

    expect(Schema.decodeUnknownSync(schema)({ value: input })).toEqual({
      value: expected,
    });
  });
});

describe("ZeroClaw adapter", () => {
  it("selects the configured agent and sends no task id", async () => {
    const webhook = await startWebhook(completed);
    const adapter = await makeAdapter(webhook.url);

    const result = await adapter.sendMessage(
      { message: "hi", model: "coder" },
      logger,
    )();

    expect(E.isRight(result) && result.right.data.message).toBe("final answer");
    expect(webhook.bodies[0].model).toBe("lies_exposed");
    expect(webhook.bodies[0].context).toEqual({
      wakeReason: "manual_chat",
      message: "hi",
    });
  });

  it.each([
    ["a-token", "Bearer a-token"],
    [undefined, undefined],
  ])("authorizes with token %s", async (token, header) => {
    const webhook = await startWebhook(completed);
    const adapter = await makeAdapter(webhook.url, token);

    await adapter.sendMessage({ message: "hi" }, logger)();

    expect(webhook.authorizations).toEqual([header]);
  });

  it.each([
    [
      "a failed run",
      [{ type: "result", status: "error", error: "boom" }],
      200,
      "run error: boom",
    ],
    [
      "a truncated stream",
      [{ type: "started" }],
      200,
      "without a result frame",
    ],
    ["an HTTP error", [], 503, "webhook returned 503"],
  ])("fails on %s", async (_name, frames, status, message) => {
    const webhook = await startWebhook(frames, status);
    const adapter = await makeAdapter(webhook.url);

    const result = await adapter.sendMessage({ message: "hi" }, logger)();

    expect(E.isLeft(result) && result.left.message).toContain(message);
  });
});

describe("streamZeroClawReply", () => {
  const run = async (frames: object[]) => {
    const webhook = await startWebhook(frames);
    const adapter = await makeAdapter(webhook.url);
    const chunks: string[] = [];
    const res = {
      on: vi.fn(),
      setHeader: vi.fn(),
      flushHeaders: vi.fn(),
      write: (chunk: string) => chunks.push(chunk),
      end: vi.fn(),
    };

    await streamZeroClawReply(
      adapter,
      { body: { message: "hi" } } as Request,
      res as unknown as Response,
      logger,
      "correlation-id",
    );

    expect(res.end).toHaveBeenCalled();
    return chunks.map((c) => JSON.parse(c.slice("data: ".length)));
  };

  it("sends the reply as SSE events", async () => {
    const events = await run(completed);

    expect(events.map((e) => e.type)).toEqual([
      "message_start",
      "content_delta",
      "message_end",
    ]);
    expect(events[2].content).toBe("final answer");
    expect(events[2].message_id).toBe(events[0].message_id);
  });

  it("sends an error event when the run fails", async () => {
    const events = await run([{ type: "result", status: "timeout" }]);

    expect(events.map((e) => e.type)).toEqual(["message_start", "error"]);
  });
});
