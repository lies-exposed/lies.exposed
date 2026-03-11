import { fp } from "@liexp/core/lib/fp/index.js";
import { CreateAreaInputSchema } from "@liexp/shared/lib/mcp/schemas/areas.schemas.js";
import { makeCommand } from "../run-command.js";

export const areaCreate = makeCommand(
  CreateAreaInputSchema,
  {
    usage: "area create",
    description: "Create a new geographic area.",
    output: "JSON created area object",
  },
  (input, ctx) => {
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
);
