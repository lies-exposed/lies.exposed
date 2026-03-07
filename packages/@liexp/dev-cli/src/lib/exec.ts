import { spawn } from "node:child_process";
import { REPO_ROOT } from "./paths.js";

export type ExecOptions = {
  /** Working directory for the spawned process. Defaults to the repo root. */
  cwd?: string;
  /** Environment variables to merge with process.env. */
  env?: Record<string, string>;
  /** Called with each line of stdout. */
  onStdout?: (line: string) => void;
  /** Called with each line of stderr. */
  onStderr?: (line: string) => void;
  /** If true, stdin of the child process is inherited from the parent (needed for docker login --password-stdin). */
  inheritStdin?: boolean;
};

export type ExecResult = {
  exitCode: number;
  stdout: string[];
  stderr: string[];
};

/**
 * Spawns a child process and streams its output line-by-line.
 * Resolves when the process exits; rejects on spawn error.
 */
export function exec(
  command: string,
  args: string[],
  options: ExecOptions = {}
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    const stdoutLines: string[] = [];
    const stderrLines: string[] = [];

    const child = spawn(command, args, {
      cwd: options.cwd ?? REPO_ROOT,
      env: { ...process.env, ...options.env },
      stdio: options.inheritStdin
        ? ["inherit", "pipe", "pipe"]
        : ["ignore", "pipe", "pipe"],
    });

    // Buffer handling for partial lines across chunks
    let stdoutBuf = "";
    let stderrBuf = "";

    const flushLines = (
      buf: string,
      cb: ((line: string) => void) | undefined,
      lines: string[]
    ): string => {
      const parts = buf.split("\n");
      // Everything except the last element is a complete line
      for (let i = 0; i < parts.length - 1; i++) {
        const line = parts[i]!.replace(/\r$/, "");
        lines.push(line);
        cb?.(line);
      }
      // Return the incomplete tail for the next chunk
      return parts[parts.length - 1] ?? "";
    };

    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBuf += chunk.toString();
      stdoutBuf = flushLines(stdoutBuf, options.onStdout, stdoutLines);
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderrBuf += chunk.toString();
      stderrBuf = flushLines(stderrBuf, options.onStderr, stderrLines);
    });

    child.on("error", reject);

    child.on("close", (code) => {
      // Flush any remaining partial line
      if (stdoutBuf) {
        stdoutLines.push(stdoutBuf);
        options.onStdout?.(stdoutBuf);
      }
      if (stderrBuf) {
        stderrLines.push(stderrBuf);
        options.onStderr?.(stderrBuf);
      }
      resolve({ exitCode: code ?? 1, stdout: stdoutLines, stderr: stderrLines });
    });
  });
}

/**
 * Run a shell pipeline command by passing a command string to `sh -c`.
 * Useful for piping (e.g. `cat file | docker login --password-stdin`).
 */
export function execShell(
  cmd: string,
  options: ExecOptions = {}
): Promise<ExecResult> {
  return exec("sh", ["-c", cmd], options);
}
