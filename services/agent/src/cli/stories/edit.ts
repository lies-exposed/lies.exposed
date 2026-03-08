import { fp } from "@liexp/core/lib/fp/index.js";
import { EditStoryInputSchema } from "@liexp/shared/lib/mcp/schemas/stories.schemas.js";
import { getArg, splitUUIDs } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

export const storyEdit: CommandModule = {
  help: `
Usage: agent story edit [options]

Edit an existing story by UUID.

Options:
  --id=<uuid>                  Story UUID (required)
  --title=<string>             Story title
  --path=<string>              URL-friendly path slug
  --date=<YYYY-MM-DD>          Publication date
  --draft=<true|false>         Draft status
  --creator=<uuid>             Creator actor UUID
  --featuredImage=<uuid>       Featured image media UUID
  --keywords=<uuid,uuid,...>   Comma-separated keyword UUIDs
  --links=<uuid,uuid,...>      Comma-separated link UUIDs
  --actors=<uuid,uuid,...>     Comma-separated actor UUIDs
  --groups=<uuid,uuid,...>     Comma-separated group UUIDs
  --events=<uuid,uuid,...>     Comma-separated event UUIDs
  --media=<uuid,uuid,...>      Comma-separated media UUIDs
  --help                       Show this help message

Output: JSON updated story object
`,
  run: (ctx, args) =>
    runCommand(
      ctx,
      EditStoryInputSchema,
      {
        id: getArg(args, "id"),
        title: getArg(args, "title"),
        path: getArg(args, "path"),
        date: getArg(args, "date"),
        draft: getArg(args, "draft"),
        creator: getArg(args, "creator"),
        featuredImage: getArg(args, "featuredImage"),
        keywords: getArg(args, "keywords"),
        links: getArg(args, "links"),
        actors: getArg(args, "actors"),
        groups: getArg(args, "groups"),
        events: getArg(args, "events"),
        media: getArg(args, "media"),
      },
      (input) => {
        ctx.logger.debug.log("story edit input: %O", input);

        if (!input.id) {
          return fp.TE.left(new Error("--id is required"));
        }

        return ctx.api.Story.Edit({
          Params: { id: input.id as any },
          Body: {
            title: input.title ?? "",
            path: input.path ?? "",
            date: input.date ? new Date(input.date) : new Date(),
            draft: input.draft ?? false,
            creator: (input.creator ?? null) as any,
            featuredImage: (input.featuredImage
              ? { id: input.featuredImage as any }
              : null) as any,
            body2: [] as any,
            keywords: splitUUIDs(input.keywords) as any[],
            links: splitUUIDs(input.links) as any[],
            actors: splitUUIDs(input.actors) as any[],
            groups: splitUUIDs(input.groups) as any[],
            events: splitUUIDs(input.events) as any[],
            media: splitUUIDs(input.media) as any[],
            restore: null as any,
          },
        });
      },
    ),
};
