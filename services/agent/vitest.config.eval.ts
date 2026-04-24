import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";
import { EvalCacheReporter } from "./test/evalCacheReporter.js";

/**
 * Eval project — runs the full agent pipeline against a real LLM.
 *
 * Intentionally NOT referenced in vitest.config.ts so it is never executed
 * by the CI `test` script. Run locally with:
 *
 *   pnpm test:eval
 *
 * Results are cached in .eval-cache.json. Tests that passed in a previous run
 * are skipped automatically when wrapped with `cachedTest()`.
 */
export default extendBaseConfig(import.meta.url, (toAlias) => ({
  root: toAlias("./"),
  test: {
    name: "agent-eval",
    root: toAlias("./"),
    globals: true,
    watch: false,
    setupFiles: [toAlias("./test/evalSetup.ts")],
    include: [toAlias("./src/**/*.eval.ts")],
    exclude: ["**/build"],
    // Real LLM calls can be slow
    testTimeout: 360_000,
    hookTimeout: 60_000,
    pool: "forks",
    reporters: ["verbose", new EvalCacheReporter()],
    // Env vars are loaded from .env.local in evalSetup.ts.
    env: {
      NODE_ENV: "test",
      NODE_TLS_REJECT_UNAUTHORIZED: "0",
      LOCALAI_MODEL: "gemma-4-e4b-it",
    },
  },
}));
