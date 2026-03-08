import { fp } from "@liexp/core/lib/fp/index.js";
import { CreateStoryInputSchema } from "@liexp/shared/lib/mcp/schemas/stories.schemas.js";
import { splitUUIDs } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const storyCreate: CommandModule = {
  help: `
Usage: agent story create [options]

Create a new story.

Options:
  --title=<string>             Story title (required)
  --path=<string>              URL-friendly path slug (required)
  --date=<YYYY-MM-DD>          Publication date (required)
  --draft=<true|false>         Draft status (default: true)
  --creator=<uuid>             Creator actor UUID
  --featuredImage=<uuid>       Featured image media UUID
  --keywords=<uuid,uuid,...>   Comma-separated keyword UUIDs
  --actors=<uuid,uuid,...>     Comma-separated actor UUIDs
  --groups=<uuid,uuid,...>     Comma-separated group UUIDs
  --events=<uuid,uuid,...>     Comma-separated event UUIDs
  --media=<uuid,uuid,...>      Comma-separated media UUIDs
  --help                       Show this help message

Output: JSON created story object
`,
  run: (ctx, args) =>
    runCliCommand(ctx, CreateStoryInputSchema, args, (input) => {
      ctx.logger.debug.log("story create input: %O", input);

      if (!input.title || !input.path || !input.date) {
        return fp.TE.left(
          new Error("--title, --path, and --date are required"),
        );
      }

      return ctx.api.Story.Create({
        Body: {
          title: input.title,
          path: input.path,
          date: new Date(input.date),
          draft: input.draft ?? true,
          creator: (input.creator ?? null) as any,
          featuredImage: (input.featuredImage ?? null) as any,
          body2: [] as any,
          keywords: input.keywords,
          actors: input.actors,
          groups: input.groups,
          events: input.events,
          media: input.media,
        },
      });
    }),
};
