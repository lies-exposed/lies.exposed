import { fp } from "@liexp/core/lib/fp/index.js";
import { CreateStoryInputSchema } from "@liexp/shared/lib/mcp/schemas/stories.schemas.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

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
    runCommand(
      ctx,
      CreateStoryInputSchema,
      {
        title: getArg(args, "title"),
        path: getArg(args, "path"),
        date: getArg(args, "date"),
        draft: getArg(args, "draft"),
        creator: getArg(args, "creator"),
        featuredImage: getArg(args, "featuredImage"),
        keywords: getArg(args, "keywords"),
        actors: getArg(args, "actors"),
        groups: getArg(args, "groups"),
        events: getArg(args, "events"),
        media: getArg(args, "media"),
      },
      (input) => {
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
            creator: input.creator ?? undefined,
            featuredImage: input.featuredImage ?? undefined,
            body2: [] as any,
            keywords: input.keywords,
            actors: input.actors,
            groups: input.groups,
            events: input.events,
            media: input.media,
          } as any,
        });
      },
    ),
};
