import { EditMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
import { splitUUIDs } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const mediaEdit: CommandModule = {
  help: `
Usage: agent media edit [options]

Edit an existing media entry by UUID.

Options:
  --id=<uuid>                  Media UUID (required)
  --location=<url>             URL of the media file (required)
  --type=<string>              MIME type (required), e.g. image/jpg, video/mp4
  --label=<string>             Human-readable label (required)
  --description=<string>       Description
  --thumbnail=<url>            URL of thumbnail image
  --events=<uuid,uuid,...>     Comma-separated event UUIDs
  --links=<uuid,uuid,...>      Comma-separated link UUIDs
  --keywords=<uuid,uuid,...>   Comma-separated keyword UUIDs
  --areas=<uuid,uuid,...>      Comma-separated area UUIDs
  --help                       Show this help message

Output: JSON updated media object
`,
  run: (ctx, args) =>
    runCliCommand(ctx, EditMediaInputSchema, args, (input) => {
      ctx.logger.debug.log("media edit input: %O", input);
      return ctx.api.Media.Edit({
        Params: { id: input.id as any },
        Body: {
          location: input.location as any,
          type: input.type as any,
          label: input.label,
          description: input.description ?? null,
          thumbnail: input.thumbnail ? (input.thumbnail as any) : null,
          extra: null,
          events: splitUUIDs(input.events) as any[],
          links: splitUUIDs(input.links) as any[],
          keywords: splitUUIDs(input.keywords) as any[],
          areas: splitUUIDs(input.areas) as any[],
          creator: null,
          overrideThumbnail: null,
          overrideExtra: null,
          transfer: null,
          transferThumbnail: null,
          restore: null,
        } as any,
      });
    }),
};
