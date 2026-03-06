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

Examples: "actor list --fullName=Obama --end=5", "actor get --id=<uuid>", "actor create --username=obama --fullName=\\"Barack Obama\\""`,
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
      name: "cli",
      description:
        "PRIMARY tool for all actor operations on the lies.exposed internal database. Use this to list, search, get, create, or edit actors — NOT web search. Pass the full command string including group, subcommand, and flags.",
      schema: effectToZod(CliInputSchema),
    },
  );
