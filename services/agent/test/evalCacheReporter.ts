import type { TestCase } from "vitest/node";
import { readCache, writeCache } from "./evalCache.js";

/**
 * Vitest 4 reporter that persists eval test results to `.eval-cache.json`.
 *
 * After each run the cache is updated so that `cachedTest()` can skip
 * previously-passing tests on the next invocation, avoiding redundant
 * (and expensive) real LLM calls.
 */
export class EvalCacheReporter {
  private updates = new Map<string, "pass" | "fail">();

  onTestCaseResult(testCase: TestCase): void {
    const result = testCase.result();
    // `fullName` includes the parent suite path, e.g.
    // "actor operations > listing actors calls liexp_cli with actor list"
    const key = testCase.fullName;

    if (result.state === "passed") {
      this.updates.set(key, "pass");
    } else if (result.state === "failed") {
      // A previously-passing test that now fails should be cleared from cache
      // so it re-runs next time.
      this.updates.set(key, "fail");
    }
    // "skipped" / "pending" — leave the existing cache entry untouched.
  }

  onTestRunEnd(): void {
    if (this.updates.size === 0) return;

    const cache = readCache();
    const timestamp = new Date().toISOString();

    for (const [key, status] of this.updates) {
      if (status === "pass") {
        cache[key] = { status: "pass", timestamp };
      } else {
        // Remove failed test from cache so it runs again next time
        delete cache[key];
      }
    }

    writeCache(cache);
    this.updates.clear();
  }
}
