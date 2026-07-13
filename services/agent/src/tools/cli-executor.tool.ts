import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { effectToZod } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
import { tool } from "langchain";

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

const CliInputSchema = Schema.Struct({
  command: Schema.String.annotations({
    description: `CLI command to run. Format: <group> <subcommand> [--flag=value]

Wrap any flag value containing spaces in double quotes, e.g. --fullName="Alan Turing" — unquoted multi-word values are silently truncated at the first space.

Groups and subcommands:
  actor list         [--fullName=<name>] [--memberIn=<uuid>] [--start=N] [--end=N] [--sort=createdAt|updatedAt|username] [--order=ASC|DESC]
  actor get          --id=<uuid>
  actor create       --username=<slug> --fullName=<name> [--excerpt=<text>] [--avatar=<uuid>] [--bornOn=YYYY-MM-DD] [--diedOn=YYYY-MM-DD] [--color=<hex>]
  actor edit         --id=<uuid> [--fullName=<name>] [--excerpt=<text>] [--avatar=<uuid>] [--bornOn=YYYY-MM-DD] [--diedOn=YYYY-MM-DD] [--memberIn=<uuid>]
  actor find-avatar  --fullName=<name>  (search Wikipedia for avatar image and save to platform)

  group list         [--query=<name>] [--start=N] [--end=N] [--sort=createdAt|name] [--order=ASC|DESC]
  group get          --id=<uuid>
  group create       --name=<name> --username=<slug> --kind=<Public|Private> [--excerpt=<text>] [--avatar=<uuid>] [--startDate=YYYY-MM-DD] [--endDate=YYYY-MM-DD] [--color=<hex>]
  group edit         --id=<uuid> [--name=<name>] [--kind=<Public|Private>] [--excerpt=<text>] [--members=<actor-uuid>]
  group find-avatar  --name=<name>  (search Wikipedia for avatar image and save to platform)

  area list          [--query=<label>] [--start=N] [--end=N] [--sort=createdAt|label] [--order=ASC|DESC]
  area get           --id=<uuid>
  area create        --label=<name> --slug=<slug> [--draft=true|false] [--geometry=<geojson>]
  area edit          --id=<uuid> [--label=<name>] [--slug=<slug>] [--draft=true|false] [--geometry=<geojson>] [--featuredImage=<uuid>] [--media=<uuid,...>] [--events=<uuid,...>]

  link list          [--query=<text>] [--start=N] [--end=N] [--sort=createdAt|title|url] [--order=ASC|DESC]
  link get           --id=<uuid>
  link create        --url=<url>
  link edit          --id=<uuid> [--title=<text>] [--description=<text>] [--url=<url>] [--status=DRAFT|APPROVED|UNAPPROVED] [--publishDate=YYYY-MM-DD] [--events=<uuid,...>] [--keywords=<uuid,...>]

  media list         [--query=<text>] [--start=N] [--end=N] [--sort=createdAt|label] [--order=ASC|DESC]
  media get          --id=<uuid>
  media create       --location=<url> --type=<mime> [--label=<text>] [--description=<text>] [--thumbnail=<url>] [--events=<uuid,...>] [--links=<uuid,...>] [--keywords=<uuid,...>] [--areas=<uuid,...>]
  media edit         --id=<uuid> --location=<url> --type=<mime> --label=<text> [--description=<text>] [--thumbnail=<url>] [--events=<uuid,...>] [--links=<uuid,...>] [--keywords=<uuid,...>] [--areas=<uuid,...>]

  nation list        [--name=<text>] [--start=N] [--end=N]
  nation get         --id=<uuid>

  event list         [--query=<text>] [--actors=<uuid>] [--groups=<uuid>] [--type=Death|ScientificStudy|Patent|Documentary|Book|Quote|Uncategorized|Transaction] [--startDate=YYYY-MM-DD] [--endDate=YYYY-MM-DD] [--start=N] [--end=N]
  event get          --id=<uuid>

  Event creation/editing uses type-specific subcommands:
  event death create       --victim=<uuid> --date=YYYY-MM-DD [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]
  event death edit         --id=<uuid> --victim=<uuid> --date=YYYY-MM-DD [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]

  event transaction create --title=<text> --total=<number> --currency=<currency> --fromType=<type> --fromId=<uuid> --toType=<type> --toId=<uuid> --date=YYYY-MM-DD [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]
  event transaction edit   --id=<uuid> --title=<text> --total=<number> --currency=<currency> --fromType=<type> --fromId=<uuid> --toType=<type> --toId=<uuid> --date=YYYY-MM-DD [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]

  event quote create       --actor=<uuid> --quote=<text> --date=YYYY-MM-DD [--details=<text>] [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]
  event quote edit         --id=<uuid> --actor=<uuid> --quote=<text> --date=YYYY-MM-DD [--details=<text>] [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]

  event scientific-study create --title=<text> --studyUrl=<url> --date=YYYY-MM-DD [--image=<url>] [--publisher=<text>] [--authors=<uuid,...>] [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]
  event scientific-study edit   --id=<uuid> --title=<text> --studyUrl=<url> --date=YYYY-MM-DD [--image=<url>] [--publisher=<text>] [--authors=<uuid,...>] [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]

  event book create        --title=<text> --date=YYYY-MM-DD [--pdf=<url>] [--audio=<url>] [--authors=<uuid,...>] [--publisher=<uuid>] [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]
  event book edit          --id=<uuid> --title=<text> --date=YYYY-MM-DD [--pdf=<url>] [--audio=<url>] [--authors=<uuid,...>] [--publisher=<uuid>] [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]

  event patent create      --title=<text> --source=<text> --date=YYYY-MM-DD [--ownerActors=<uuid,...>] [--ownerGroups=<uuid,...>] [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]
  event patent edit        --id=<uuid> --title=<text> --source=<text> --date=YYYY-MM-DD [--ownerActors=<uuid,...>] [--ownerGroups=<uuid,...>] [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]

  event documentary create --title=<text> --date=YYYY-MM-DD [--documentaryMedia=<uuid,...>] [--website=<url>] [--authorActors=<uuid,...>] [--authorGroups=<uuid,...>] [--subjectActors=<uuid,...>] [--subjectGroups=<uuid,...>] [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]
  event documentary edit   --id=<uuid> --title=<text> --date=YYYY-MM-DD [--documentaryMedia=<uuid,...>] [--website=<url>] [--authorActors=<uuid,...>] [--authorGroups=<uuid,...>] [--subjectActors=<uuid,...>] [--subjectGroups=<uuid,...>] [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]

  event uncategorized create --title=<text> --date=YYYY-MM-DD [--actors=<uuid,...>] [--groups=<uuid,...>] [--groupsMembers=<uuid,...>] [--location=<text>] [--endDate=YYYY-MM-DD] [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]
  event uncategorized edit   --id=<uuid> --title=<text> --date=YYYY-MM-DD [--actors=<uuid,...>] [--groups=<uuid,...>] [--groupsMembers=<uuid,...>] [--location=<text>] [--endDate=YYYY-MM-DD] [--draft=true|false] [--excerpt=<text>] [--links=<uuid,...>] [--media=<uuid,...>] [--keywords=<uuid,...>]

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
