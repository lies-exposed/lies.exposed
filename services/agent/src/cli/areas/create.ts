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

    type Geometry =
      | { type: "Point"; coordinates: [number, number] }
      | { type: "Polygon"; coordinates: number[][][] };

    let geometry: Geometry | undefined = undefined;
    if (input.geometry) {
      try {
        geometry = JSON.parse(input.geometry) as Geometry;
      } catch {
        return fp.TE.left(
          new Error("--geometry must be valid JSON (GeoJSON geometry)"),
        );
      }
    }

    return ctx.api.Area.Create({
      Body: {
        ...input,
        geometry: geometry ?? {
          type: "Point" as const,
          coordinates: [0, 0] as const,
        },
        draft: input.draft ?? false,
        body: [],
      },
    });
  },
);
