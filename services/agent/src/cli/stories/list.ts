import { FindStoriesInputSchema } from "@liexp/shared/lib/mcp/schemas/stories.schemas.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

export const storyList: CommandModule = {
  help: `
Usage: agent story list [options]

Search and list stories.

Options:
  --query=<string>       Full-text search query
  --draft=<true|false>   Filter by draft status
  --creator=<uuid>       Filter by creator UUID
  --start=<number>       Pagination offset (default: 0)
  --end=<number>         Pagination limit (default: 20)
  --help                 Show this help message

Output: JSON list of story objects
`,
  run: (ctx, args) =>
    runCommand(
      ctx,
      FindStoriesInputSchema,
      {
        query: getArg(args, "query"),
        draft: getArg(args, "draft"),
        creator: getArg(args, "creator"),
        start: getArg(args, "start"),
        end: getArg(args, "end"),
      },
      (input) => {
        ctx.logger.debug.log("story list input: %O", input);
        return ctx.api.Story.List({
          Query: {
            q: input.query ?? null,
            draft: input.draft ?? null,
            creator: input.creator ?? null,
            _start: input.start !== undefined ? String(input.start) : "0",
            _end: input.end !== undefined ? String(input.end) : "20",
          } as any,
        });
      },
    ),
};
