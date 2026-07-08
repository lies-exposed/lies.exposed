import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";
import { EvalCacheReporter } from "./test/evalCacheReporter.js";

/**
 * Eval-DB project — full round trip against a throwaway Postgres DB
 * (liexp_test) and a real api-test server instance, both spun up fresh for
 * the run by test/evalDbGlobalSetup.ts and torn down after.
 *
 * Use this tier (instead of vitest.config.eval.ts) when a test needs to
 * verify liexp_cli actually persisted data, not just that the right tool
 * call shape was produced. See skills/agent_testing.md.
 *
 * Intentionally NOT referenced in vitest.config.ts so it never runs in CI's
 * default `test` script. Run locally with:
 *
 *   pnpm test:eval-db
 */
export default extendBaseConfig(import.meta.url, (toAlias) => ({
  root: toAlias("./"),
  test: {
    name: "agent-eval-db",
    root: toAlias("./"),
    globals: true,
    watch: false,
    globalSetup: [toAlias("./test/evalDbGlobalSetup.ts")],
    setupFiles: [toAlias("./test/evalDbSetup.ts")],
    include: [toAlias("./src/**/*.eval-db.ts")],
    exclude: ["**/build"],
    // Real LLM calls + a real HTTP round trip can be slow.
    testTimeout: 360_000,
    hookTimeout: 60_000,
    pool: "forks",
    // Every test file shares one api-test server + one liexp_test DB for the
    // whole run — don't run test files in parallel against it.
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    reporters: ["verbose", new EvalCacheReporter()],
    env: {
      NODE_ENV: "test",
      NODE_TLS_REJECT_UNAUTHORIZED: "0",
      LOCALAI_MODEL: "gemma-4-e4b-it",
    },
  },
}));
