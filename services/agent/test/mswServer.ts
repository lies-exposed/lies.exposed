import { setupServer } from "msw/node";

/**
 * Single shared MSW server for all agent spec tests.
 *
 * Only one `setupServer()` instance may be active per Node.js process —
 * MSW v2 uses `@mswjs/interceptors` which patches the global `fetch`.
 * Creating multiple instances causes interceptors to stack, leading to
 * handler mismatches and spurious `onUnhandledRequest` errors.
 *
 * Lifecycle is managed in `test/specSetup.ts` (vitest setupFiles):
 *   - `beforeAll`  → server.listen()
 *   - `afterEach`  → server.resetHandlers()
 *   - `afterAll`   → server.close()
 *
 * Individual test files register their handlers with `server.use()`.
 */
export const mswServer = setupServer();
