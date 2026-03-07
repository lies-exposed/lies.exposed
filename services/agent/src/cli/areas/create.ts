import { fp } from "@liexp/core/lib/fp/index.js";
import { CreateAreaInputSchema } from "@liexp/shared/lib/mcp/schemas/areas.schemas.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

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
  run: (ctx, args) =>
    runCommand(
      ctx,
      CreateAreaInputSchema,
      {
        label: getArg(args, "label"),
        slug: getArg(args, "slug"),
        draft: getArg(args, "draft"),
        geometry: getArg(args, "geometry"),
      },
      (input) => {
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
      },
    ),
};
