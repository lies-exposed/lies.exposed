import { exec } from "./exec.js";

export type TmuxOpenResult =
  | { ok: true }
  | { ok: false; reason: "no-tmux" | "no-session" | "exec-error"; message: string };

/**
 * Returns true when the process is running inside a tmux session.
 */
export function isInsideTmux(): boolean {
  return Boolean(process.env["TMUX"]);
}

/**
 * Opens a new tmux pane in the current window (vertical split), cd-ing into
 * `cwd`.
 *
 * Returns an error descriptor instead of throwing so callers can surface it
 * as UI feedback.
 */
export async function openInTmuxPane(cwd: string): Promise<TmuxOpenResult> {
  if (!isInsideTmux()) {
    return {
      ok: false,
      reason: "no-session",
      message: "Not running inside a tmux session (TMUX env var not set).",
    };
  }

  const result = await exec("tmux", [
    "split-window",
    "-h",   // horizontal split → new pane to the right
    "-c", cwd,
  ]);

  if (result.exitCode !== 0) {
    return {
      ok: false,
      reason: "exec-error",
      message: result.stderr.join("\n") || `tmux exited with code ${result.exitCode}`,
    };
  }

  return { ok: true };
}
