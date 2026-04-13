import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { test } from "vitest";

const SERVICE_ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const CACHE_FILE = path.resolve(SERVICE_ROOT, ".eval-cache.json");

// ---------------------------------------------------------------------------
// Cache file I/O
// ---------------------------------------------------------------------------

interface CacheEntry {
  status: "pass" | "fail";
  timestamp: string;
}

type EvalCache = Record<string, CacheEntry>;

export const readCache = (): EvalCache => {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8")) as EvalCache;
  } catch {
    return {};
  }
};

export const writeCache = (cache: EvalCache): void => {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2) + "\n");
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the test with the given full name passed in a previous run.
 * Used with `test.skipIf` to avoid re-running expensive LLM calls.
 */
const isPassed = (fullName: string): boolean =>
  readCache()[fullName]?.status === "pass";

/**
 * Drop-in replacement for `test()` that skips automatically when the test
 * passed in a previous eval run. Use for expensive LLM-backed eval tests.
 *
 * The `fullName` must be unique across the eval suite (typically the test's
 * display name as shown in the vitest output).
 *
 * Example:
 *   cachedTest("listing actors calls liexp_cli with actor list", async () => { ... });
 */
export const cachedTest = (
  name: string,
  fn: () => Promise<void>,
  timeout?: number,
): void => {
  test.skipIf(isPassed(name))(name, fn, timeout);
};
