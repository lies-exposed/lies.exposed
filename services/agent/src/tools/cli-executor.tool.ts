import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { effectToZod } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
import { tool } from "langchain";
import { describeCommandTree } from "../cli/groups.js";

const execFileAsync = promisify(execFile);

/**
 * Parse a shell-style command string into an argv array without invoking a
 * shell. Supports single-quoted, double-quoted, and unquoted tokens.
 * Double-quoted strings honour \" escapes. This avoids shell injection and
 * correctly handles flag values that contain double-quote characters
 * (e.g. --title="Deaths "due to" COVID-19").
 */
function parseCommandArgs(command: string): string[] {
  const args: string[] = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let i = 0;

  while (i < command.length) {
    const ch = command[i];
    if (inSingle) {
      if (ch === "'") {
        inSingle = false;
      } else {
        current += ch;
      }
    } else if (inDouble) {
      if (ch === '"') {
        inDouble = false;
      } else if (ch === "\\" && i + 1 < command.length) {
        current += command[++i];
      } else {
        current += ch;
      }
    } else {
      if (ch === "'") {
        inSingle = true;
      } else if (ch === '"') {
        inDouble = true;
      } else if (ch === " " || ch === "\t") {
        if (current) {
          args.push(current);
          current = "";
        }
      } else {
        current += ch;
      }
    }
    i++;
  }
  if (current) args.push(current);
  return args;
}

// Generated once at module load from the CLI's own command schemas (see
// #cli/groups.js) — never hand-maintained, so it cannot drift from the
// actual flags each command accepts. Run "<command> --help" for full flag
// descriptions, types, and formats (dates, UUIDs, enums, etc.) beyond the
// required/optional shape shown here.
const COMMAND_REFERENCE = describeCommandTree();

const CliInputSchema = Schema.Struct({
  command: Schema.String.annotations({
    description: `CLI command to run. Format: <group> <subcommand> [--flag=value]

Wrap any flag value containing spaces in double quotes, e.g. --fullName="Alan Turing" — unquoted multi-word values are silently truncated at the first space.

Run "<group> <subcommand> --help" (e.g. "actor create --help") for a command's full flag descriptions, value formats (dates, UUIDs, enums), and required/optional status — the table below only shows flag names.

Groups and subcommands:
${COMMAND_REFERENCE}

Examples: "actor list --fullName=Obama --end=5", "event list --query=vaccine --end=10", "link create --url=https://example.com", "actor find-avatar --fullName=Elon Musk", "event death create --victim=<actor-uuid> --date=2024-01-15"`,
  }),
});

type CliInput = typeof CliInputSchema.Type;

export const createCliExecutorTool = (cliBinPath: string) =>
  tool<any, any, any, any>(
    async (input: CliInput): Promise<string> => {
      try {
        const args = parseCommandArgs(input.command);
        const { stdout, stderr } = await execFileAsync(
          "node",
          [cliBinPath, ...args],
          // Dev-API calls are network-bound and can be slow, especially when
          // this process is concurrently running a puppeteer scrape — 30s
          // was tight enough to false-positive as a "command failed" with no
          // diagnostic (execFile SIGTERMs the child, which yields empty
          // stderr, so the model saw a bare "Command failed" and just
          // retried the same doomed call in a loop).
          { timeout: 60_000 },
        );
        return stdout || stderr || "(no output)";
      } catch (err: any) {
        if (err.killed && err.signal === "SIGTERM") {
          return `ERROR: command timed out after 60s: ${input.command}\nTry a narrower query (lower --end, more specific filters) rather than repeating the same command.`;
        }
        // err.message from execFile just repeats the full command — not useful.
        // The CLI writes structured errors to stderr. Take all content from
        // the first error-looking line onward (includes tree-formatted parse
        // errors), falling back to the last 10 lines.
        const stderrRaw: string = err.stderr ?? "";
        const stderrLines = stderrRaw.split("\n").filter(Boolean);
        const firstErrorIdx = stderrLines.findIndex(
          (l) => /:error\b/i.test(l) || /^\s*Error/i.test(l),
        );
        const summary =
          firstErrorIdx >= 0
            ? stderrLines.slice(firstErrorIdx).join("\n")
            : stderrLines.slice(-10).join("\n");

        // Also include stdout if it has content (some errors go there)
        const stdoutNote = err.stdout ? `\nstdout: ${err.stdout}` : "";

        return `ERROR (exit ${err.code ?? 1}):\n${summary || err.message}${stdoutNote}`;
      }
    },
    {
      name: "liexp_cli",
      description:
        "Interact with the lies.exposed platform: list, get, create, and edit actors, groups, events, links, media, areas, and nations. " +
        "Returns real live JSON from the database. " +
        "Use this for ANY query or modification of platform data — do NOT use searchWeb for platform data.\n\n" +
        "IMPORTANT: Always pass --end=<N> to limit results (default to 10). " +
        "For 'latest/recent' queries use --sort=createdAt --order=DESC. " +
        "Example: 'actor list --sort=createdAt --order=DESC --end=10'",
      schema: effectToZod(CliInputSchema),
    },
  );
