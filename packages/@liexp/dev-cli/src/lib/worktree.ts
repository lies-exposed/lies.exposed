import { join } from "node:path";
import { REPO_ROOT } from "./paths.js";
import { exec } from "./exec.js";
import type { ExecOptions } from "./exec.js";

/** Conventional base directory for all worktrees, relative to repo root. */
export const WORKTREES_DIR = ".worktrees";

/** Absolute path to the worktrees directory. */
export const WORKTREES_ROOT = join(REPO_ROOT, WORKTREES_DIR);

/** Absolute path for a given worktree name. */
export function worktreePath(name: string): string {
  return join(WORKTREES_ROOT, name);
}

export type WorktreeInfo = {
  path: string;
  branch: string;
  /** true when this is the main (primary) worktree */
  isMain: boolean;
};

/**
 * Parses the output of `git worktree list --porcelain` into structured records.
 *
 * Each worktree block looks like:
 *   worktree /abs/path
 *   HEAD <sha>
 *   branch refs/heads/<name>   (or "detached")
 */
export function parseWorktreeList(raw: string): WorktreeInfo[] {
  const blocks = raw.trim().split(/\n\n+/);
  const result: WorktreeInfo[] = [];
  let isFirst = true;

  for (const block of blocks) {
    const lines = block.split("\n");
    const pathLine = lines.find((l) => l.startsWith("worktree "));
    const branchLine = lines.find((l) => l.startsWith("branch "));

    if (!pathLine) continue;

    const path = pathLine.slice("worktree ".length).trim();
    const branch = branchLine
      ? branchLine.slice("branch refs/heads/".length).trim()
      : "(detached)";

    result.push({ path, branch, isMain: isFirst });
    isFirst = false;
  }

  return result;
}

/** Returns all currently registered worktrees. */
export async function listWorktrees(
  options?: Pick<ExecOptions, "onStdout" | "onStderr">
): Promise<WorktreeInfo[]> {
  const result = await exec("git", ["worktree", "list", "--porcelain"], options);
  return parseWorktreeList(result.stdout.join("\n"));
}

/**
 * Args for `git worktree add`.
 *
 * - `add(name)` — checks out existing branch `name` into `.worktrees/<name>`
 * - `add(name, { newBranch: true, base: "main" })` — creates a new branch from base
 */
export function worktreeAddArgs(
  name: string,
  opts: { newBranch?: boolean; base?: string } = {}
): string[] {
  const path = worktreePath(name);
  if (opts.newBranch) {
    return ["worktree", "add", "-b", name, path, opts.base ?? "main"];
  }
  return ["worktree", "add", path, name];
}

/** Args for `git worktree remove [--force]`. */
export function worktreeRemoveArgs(name: string, force = false): string[] {
  const path = worktreePath(name);
  return force
    ? ["worktree", "remove", "--force", path]
    : ["worktree", "remove", path];
}

/** Args for `git worktree prune`. */
export const WORKTREE_PRUNE_ARGS = ["worktree", "prune"] as const;
