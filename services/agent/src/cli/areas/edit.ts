import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { EditAreaInputSchema } from "@liexp/shared/lib/mcp/schemas/areas.schemas.js";
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

export const areaEdit: CommandModule = {
  help: `
Usage: agent area edit [options]

Edit an existing geographic area by UUID.

Options:
  --id=<uuid>              Area UUID (required)
  --label=<string>         Area name / label
  --slug=<string>          URL slug for the area
  --draft=<true|false>     Draft flag
  --geometry=<json>        GeoJSON geometry as a JSON string
  --featuredImage=<uuid>   Media UUID for the featured image
  --media=<uuid,uuid,...>  Comma-separated media UUIDs
  --events=<uuid,uuid,...> Comma-separated event UUIDs
  --help                   Show this help message

Output: JSON updated area object
`,
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(EditAreaInputSchema)({
        id: getArg(args, "id"),
        label: getArg(args, "label"),
        slug: getArg(args, "slug"),
        draft: getArg(args, "draft"),
        geometry: getArg(args, "geometry"),
        featuredImage: getArg(args, "featuredImage"),
        media: getArg(args, "media"),
        events: getArg(args, "events"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("area edit input: %O", input);

        let geometry: any = null;
        if (input.geometry) {
          try {
            geometry = JSON.parse(input.geometry);
          } catch {
            return fp.TE.left(
              new Error("--geometry must be valid JSON (GeoJSON geometry)"),
            );
          }
        }

        return ctx.api.Area.Edit({
          Params: { id: input.id as any },
          Body: {
            label: input.label ?? null,
            slug: input.slug ?? null,
            draft: input.draft ?? null,
            geometry: geometry,
            body: null,
            featuredImage: input.featuredImage
              ? (input.featuredImage as any)
              : null,
            media: splitUUIDs(input.media) as any[],
            events: input.events ? (splitUUIDs(input.events) as any[]) : null,
            updateGeometry: geometry !== null ? true : null,
          } as any,
        });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("area edit response: id=%s", result.data.id);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
