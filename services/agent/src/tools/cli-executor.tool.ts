import { exec } from "node:child_process";
import { promisify } from "node:util";
import { effectToZod } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
import { tool } from "langchain";

const execAsync = promisify(exec);

const CliInputSchema = Schema.Struct({
  command: Schema.String.annotations({
    description: `CLI command to run. Format: <group> <subcommand> [--flag=value]

Groups and subcommands:
  actor list    [--fullName=<name>] [--memberIn=<uuid>] [--start=N] [--end=N] [--sort=createdAt|updatedAt|username] [--order=ASC|DESC]
  actor get     --id=<uuid>
  actor create  --username=<slug> --fullName=<name> [--excerpt=<text>] [--avatar=<uuid>] [--bornOn=YYYY-MM-DD] [--diedOn=YYYY-MM-DD] [--color=<hex>]
  actor edit    --id=<uuid> [--fullName=<name>] [--excerpt=<text>] [--avatar=<uuid>] [--bornOn=YYYY-MM-DD] [--diedOn=YYYY-MM-DD] [--memberIn=<uuid>]

  group list    [--query=<name>] [--start=N] [--end=N] [--sort=createdAt|name] [--order=ASC|DESC]
  group get     --id=<uuid>
  group create  --name=<name> --username=<slug> --kind=<Public|Private> [--excerpt=<text>] [--avatar=<uuid>] [--startDate=YYYY-MM-DD] [--endDate=YYYY-MM-DD] [--color=<hex>]
  group edit    --id=<uuid> [--name=<name>] [--kind=<Public|Private>] [--excerpt=<text>] [--members=<actor-uuid>]

  area list     [--query=<label>] [--start=N] [--end=N] [--sort=createdAt|label] [--order=ASC|DESC]
  area get      --id=<uuid>

  link list     [--query=<text>] [--start=N] [--end=N] [--sort=createdAt|title|url] [--order=ASC|DESC]
  link get      --id=<uuid>
  link create   --url=<url>

  media list    [--query=<text>] [--start=N] [--end=N] [--sort=createdAt|label] [--order=ASC|DESC]
  media get     --id=<uuid>

  nation list   [--name=<text>] [--start=N] [--end=N]
  nation get    --id=<uuid>

  event list    [--query=<text>] [--actors=<uuid>] [--groups=<uuid>] [--type=Death|ScientificStudy|Patent|Documentary|Transaction|Book|Quote|Uncategorized] [--startDate=YYYY-MM-DD] [--endDate=YYYY-MM-DD] [--start=N] [--end=N]
  event get     --id=<uuid>

Examples: "actor list --fullName=Obama --end=5", "event list --query=vaccine --end=10", "link create --url=https://example.com"`,
  }),
});

type CliInput = typeof CliInputSchema.Type;

export const createCliExecutorTool = (cliBinPath: string) =>
  tool<any, any, any, any>(
    async (input: CliInput): Promise<string> => {
      try {
        const { stdout, stderr } = await execAsync(
          `node ${cliBinPath} ${input.command}`,
          { timeout: 30_000 },
        );
        return stdout || stderr || "(no output)";
      } catch (err: any) {
        const stderr = err.stderr ? `\nstderr: ${err.stderr}` : "";
        return `Error (exit ${err.code ?? 1}): ${err.message}${stderr}`;
      }
    },
    {
      name: "find_platform_data",
      description:
        "Query the lies.exposed database to find actors, groups, events, links, media, areas, or nations. " +
        "Returns real live JSON from the database. " +
        "Use this for ANY query about people, organizations, events, or sources tracked in the platform. " +
        "Do NOT use searchWeb — this tool is the correct one for all platform data.\n\n" +
        "IMPORTANT: Always pass --end=<N> to limit results (default to 10). " +
        "For 'latest/recent' queries use --sort=createdAt --order=DESC. " +
        "Example: 'actor list --sort=createdAt --order=DESC --end=10'",
      schema: effectToZod(CliInputSchema),
    },
  );
