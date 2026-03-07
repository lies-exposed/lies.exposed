import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { EditMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

const splitUUIDs = (value: string | undefined): string[] =>
  value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

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
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(EditMediaInputSchema)({
        id: getArg(args, "id"),
        location: getArg(args, "location"),
        type: getArg(args, "type"),
        label: getArg(args, "label"),
        description: getArg(args, "description"),
        thumbnail: getArg(args, "thumbnail"),
        events: getArg(args, "events"),
        links: getArg(args, "links"),
        keywords: getArg(args, "keywords"),
        areas: getArg(args, "areas"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
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
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("media edit response: id=%s", result.data.id);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
