import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type ChatStreamEvent } from "@liexp/io/lib/http/Chat.js";

const SERVICE_ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const DEBUG_DIR = path.resolve(SERVICE_ROOT, ".eval-debug");
const HTTP_DIR = path.resolve(DEBUG_DIR, "http");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sanitize = (name: string) =>
  name
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

// ---------------------------------------------------------------------------
// Record — capture real HTTP traffic to .eval-debug/http/
// ---------------------------------------------------------------------------

interface HttpFixture {
  url: string;
  method: string;
  requestBody: unknown;
  status: number;
  responseBody: unknown;
}

/**
 * Returns a fetch wrapper that writes each request/response pair to
 * .eval-debug/http/<index>-<url-slug>.json.
 *
 * Only active when DEBUG_EVAL=1; otherwise returns native fetch unchanged.
 */
export const makeDebugFetch = (): typeof globalThis.fetch => {
  if (!process.env.DEBUG_EVAL) return globalThis.fetch;

  let seq = 0;

  return async (input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;

    const slug = url
      .replace(/^https?:\/\//, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .slice(0, 60);

    const index = String(++seq).padStart(3, "0");

    let reqBody: unknown = null;
    try {
      reqBody = init?.body ? JSON.parse(init.body as string) : null;
    } catch {
      reqBody = String(init?.body ?? "");
    }

    const response = await globalThis.fetch(input, init);

    const clone = response.clone();
    let resBody: unknown;
    try {
      resBody = await clone.text();
      try {
        resBody = JSON.parse(resBody as string);
      } catch {
        /* keep as raw SSE text */
      }
    } catch {
      resBody = "(unreadable)";
    }

    fs.mkdirSync(HTTP_DIR, { recursive: true });
    fs.writeFileSync(
      path.resolve(HTTP_DIR, `${index}-${slug}.json`),
      JSON.stringify(
        { url, method: init?.method ?? "GET", requestBody: reqBody, status: response.status, responseBody: resBody },
        null,
        2,
      ) + "\n",
    );

    return response;
  };
};

// ---------------------------------------------------------------------------
// Replay — serve previously recorded HTTP fixtures instead of real calls
// ---------------------------------------------------------------------------

/**
 * Returns a fetch wrapper that replays HTTP fixtures from .eval-debug/http/
 * in order, without hitting the real LLM.
 *
 * Usage: REPLAY_EVAL=1 pnpm test:eval
 *
 * The fixtures must have been recorded first with DEBUG_EVAL=1.
 * Requests are matched by URL; multiple calls to the same URL are served
 * in the order they were recorded.
 */
export const makeReplayFetch = (): typeof globalThis.fetch => {
  // Load fixtures grouped by URL in recorded order
  const fixtures: HttpFixture[] = fs
    .readdirSync(HTTP_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.resolve(HTTP_DIR, f), "utf-8")) as HttpFixture);

  // Queue per URL so multiple calls to the same endpoint are served in order
  const queues = new Map<string, HttpFixture[]>();
  for (const fixture of fixtures) {
    if (!queues.has(fixture.url)) queues.set(fixture.url, []);
    queues.get(fixture.url)!.push(fixture);
  }

  return async (input) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;

    const queue = queues.get(url);
    const fixture = queue?.shift();

    if (!fixture) {
      throw new Error(
        `[REPLAY_EVAL] No recorded fixture for ${url}.\n` +
          `Run with DEBUG_EVAL=1 first to capture responses.`,
      );
    }

    // SSE (streaming) responses are stored as raw text; JSON responses as objects
    const isSSE = typeof fixture.responseBody === "string";
    const body = isSSE
      ? (fixture.responseBody as string)
      : JSON.stringify(fixture.responseBody);

    return new Response(body, {
      status: fixture.status,
      headers: {
        "content-type": isSSE ? "text/event-stream" : "application/json",
      },
    });
  };
};

// ---------------------------------------------------------------------------
// Event loggers
// ---------------------------------------------------------------------------

/**
 * Writes processed ChatStreamEvents to .eval-debug/<name>.json.
 * Only active when DEBUG_EVAL=1.
 */
export const debugEvents = (
  testName: string,
  events: ChatStreamEvent[],
): void => {
  if (!process.env.DEBUG_EVAL) return;
  fs.mkdirSync(DEBUG_DIR, { recursive: true });
  fs.writeFileSync(
    path.resolve(DEBUG_DIR, `${sanitize(testName)}.json`),
    JSON.stringify(events, null, 2) + "\n",
  );
};

/**
 * Writes raw LangGraph streamEvents to .eval-debug/<name>-raw.json.
 * Only active when DEBUG_EVAL=1.
 */
export const debugRawEvents = (testName: string, events: unknown[]): void => {
  if (!process.env.DEBUG_EVAL) return;
  fs.mkdirSync(DEBUG_DIR, { recursive: true });
  fs.writeFileSync(
    path.resolve(DEBUG_DIR, `${sanitize(testName)}-raw.json`),
    JSON.stringify(events, null, 2) + "\n",
  );
};
