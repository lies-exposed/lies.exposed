import { CreateMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
import { getArg, splitUUIDs } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

export const mediaCreate: CommandModule = {
  help: `
Usage: agent media create [options]

Create a new media entry.

Options:
  --location=<url>             URL of the media file (required)
  --type=<string>              MIME type (required), e.g. image/jpg, video/mp4, application/pdf
  --label=<string>             Human-readable label
  --description=<string>       Description
  --thumbnail=<url>            URL of thumbnail image
  --events=<uuid,uuid,...>     Comma-separated event UUIDs to associate
  --links=<uuid,uuid,...>      Comma-separated link UUIDs to associate
  --keywords=<uuid,uuid,...>   Comma-separated keyword UUIDs to associate
  --areas=<uuid,uuid,...>      Comma-separated area UUIDs to associate
  --help                       Show this help message

Output: JSON created media object
`,
  run: (ctx, args) =>
    runCommand(
      ctx,
      CreateMediaInputSchema,
      {
        location: getArg(args, "location"),
        type: getArg(args, "type"),
        label: getArg(args, "label"),
        description: getArg(args, "description"),
        thumbnail: getArg(args, "thumbnail"),
        events: splitUUIDs(getArg(args, "events")),
        links: splitUUIDs(getArg(args, "links")),
        keywords: splitUUIDs(getArg(args, "keywords")),
        areas: splitUUIDs(getArg(args, "areas")),
      },
      (input) => {
        ctx.logger.debug.log("media create input: %O", input);
        return ctx.api.Media.Create({
          Body: {
            id: undefined,
            location: input.location as any,
            type: input.type as any,
            label: input.label,
            description: input.description,
            thumbnail: input.thumbnail as any,
            extra: undefined,
            events: (input.events ?? []) as any[],
            links: (input.links ?? []) as any[],
            keywords: (input.keywords ?? []) as any[],
            areas: (input.areas ?? []) as any[],
          },
        });
      },
    ),
};
