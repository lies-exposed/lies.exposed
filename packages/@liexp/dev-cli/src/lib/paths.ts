import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

/**
 * Absolute path to the monorepo root.
 *
 * We ask git for the main worktree root rather than deriving the path from
 * import.meta.url. The file-based approach breaks when the CLI is run from
 * inside a secondary worktree (e.g. .worktrees/opencode/) because the walk-up
 * from the script's location lands inside that worktree instead of the primary
 * repo root, causing new worktrees to be nested inside the current one.
 *
 * `git rev-parse --path-format=absolute --git-common-dir` returns the shared
 * .git directory that all worktrees point to, which always lives under the
 * primary worktree root. Stripping the trailing `/.git` gives us the repo root
 * regardless of which worktree the process is running from.
 */
function resolveRepoRoot(): string {
  try {
    const commonDir = execSync(
      "git rev-parse --path-format=absolute --git-common-dir",
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    // commonDir is the absolute path to the shared .git dir, e.g. /repo/.git
    // Strip the trailing /.git to get the primary worktree root.
    return commonDir.replace(/[/\\]\.git$/, "");
  } catch {
    // Fallback for environments without git (e.g. bare unit tests).
    return resolve(fileURLToPath(import.meta.url), "../../../../../..");
  }
}

export const REPO_ROOT: string = resolveRepoRoot();
