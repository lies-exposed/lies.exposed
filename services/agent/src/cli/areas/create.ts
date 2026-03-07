import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { CreateAreaInputSchema } from "@liexp/shared/lib/mcp/schemas/areas.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

export const areaCreate: CommandModule = {
  help: `
Usage: agent area create [options]

Create a new geographic area.

Options:
  --label=<string>     Area name / label (required)
  --slug=<string>      URL slug for the area (required)
  --draft=<true|false> Draft flag (default: false)
  --geometry=<json>    GeoJSON geometry as a JSON string (optional)
  --help               Show this help message

Output: JSON created area object
`,
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(CreateAreaInputSchema)({
        label: getArg(args, "label"),
        slug: getArg(args, "slug"),
        draft: getArg(args, "draft"),
        geometry: getArg(args, "geometry"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("area create input: %O", input);

        let geometry: any = undefined;
        if (input.geometry) {
          try {
            geometry = JSON.parse(input.geometry);
          } catch {
            return fp.TE.left(
              new Error("--geometry must be valid JSON (GeoJSON geometry)"),
            );
          }
        }

        return ctx.api.Area.Create({
          Body: {
            label: input.label,
            slug: input.slug,
            draft: input.draft ?? false,
            geometry: geometry ?? {
              type: "Point",
              coordinates: [0, 0],
            },
            body: [] as any,
          },
        });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("area create response: id=%s", result.data.id);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
