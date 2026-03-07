import { fp } from "@liexp/core/lib/fp/index.js";
import { EditAreaInputSchema } from "@liexp/shared/lib/mcp/schemas/areas.schemas.js";
import { getArg, splitUUIDs } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

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
  run: (ctx, args) =>
    runCommand(
      ctx,
      EditAreaInputSchema,
      {
        id: getArg(args, "id"),
        label: getArg(args, "label"),
        slug: getArg(args, "slug"),
        draft: getArg(args, "draft"),
        geometry: getArg(args, "geometry"),
        featuredImage: getArg(args, "featuredImage"),
        media: getArg(args, "media"),
        events: getArg(args, "events"),
      },
      (input) => {
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
      },
    ),
};
