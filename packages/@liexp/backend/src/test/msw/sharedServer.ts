import type { RequestHandler } from "msw";
import { setupServer } from "msw/node";

/**
 * Single shared MSW server for the whole test process.
 *
 * Only one `setupServer()` instance may be active per Node.js process: MSW v2
 * uses `@mswjs/interceptors`, which patches the global `fetch` / `http` client
 * at module scope. A second instance stacks its interceptors on top of the
 * first, so requests start resolving against the wrong handler set.
 *
 * This is what made the admin e2e Production-Mode tests answer `500` whenever
 * the web e2e project had already spun up its own server in the same fork: the
 * `web-e2e` and `admin` (e2e) vitest projects run in one shared fork
 * (`pool: "forks"` + `singleFork: true` + `isolate: false`), and each
 * AppTest helper used to call `setupServer(...).listen()` on its own instance.
 *
 * Both `WebAppTest` and `AdminAppTest` now register their handlers on this one
 * instance via {@link registerMswHandlers}. They must not call `setupServer()`,
 * `.listen()` or `.close()` themselves.
 */
export const sharedMswServer = setupServer();

let listening = false;

/**
 * Start the shared server once (idempotent) and append `handlers` to it.
 *
 * Handlers are added with `.use(...)` rather than passed to `setupServer(...)`
 * so multiple callers (web + admin) can each contribute their own set without
 * clobbering the others. Origins do not overlap, so accumulation is safe and no
 * per-test `resetHandlers()` is needed.
 */
export const registerMswHandlers = (...handlers: RequestHandler[]): void => {
  if (!listening) {
    sharedMswServer.listen({
      // Allow non-mocked requests to pass through to the real network.
      onUnhandledRequest: "warn",
    });
    listening = true;
  }
  if (handlers.length > 0) {
    sharedMswServer.use(...handlers);
  }
};
