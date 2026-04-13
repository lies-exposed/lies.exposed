import path from "path";
import { effectToZod } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
import { tool } from "langchain";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type LoggerContext } from "../../../context/logger.context.js";

const ReadDocumentationInputSchema = Schema.Struct({
  doc: Schema.String.annotations({
    description:
      "Relative path to the markdown documentation file to read, e.g. 'docs/cli-reference.md'",
  }),
});

/**
 * Creates a tool that reads markdown documentation files from the agent's
 * working directory. Use this to fetch deferred documentation on demand
 * rather than embedding large files in the system prompt.
 */
export const createReadDocumentationTool = <
  C extends FSClientContext & LoggerContext,
>(
  ctx: C,
  cwd: string,
) => {
  return tool<any, any, any, any>(
    async ({ doc }: { doc: string }): Promise<string> => {
      // Resolve and sanitize: must stay within cwd
      const resolved = path.resolve(cwd, doc);
      if (!resolved.startsWith(cwd)) {
        return `ERROR: path '${doc}' resolves outside the allowed directory.`;
      }

      ctx.logger.debug.log("Reading documentation: %s", resolved);

      const result = await ctx.fs.getObject(resolved)();
      if (result._tag === "Left") {
        return `ERROR: could not read '${doc}': ${String(result.left)}`;
      }

      return result.right;
    },
    {
      name: "read_documentation",
      description:
        "Read a markdown documentation file from the agent working directory. " +
        "Use this to fetch command references, workflows, or guides on demand instead of relying on memory. " +
        "Available files: 'docs/cli-reference.md' (full liexp_cli command reference with flags and examples).",
      schema: effectToZod(ReadDocumentationInputSchema),
    },
  );
};
