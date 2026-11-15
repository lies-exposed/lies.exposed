import { fp } from "@liexp/core/lib/fp/index.js";
import { type Geometry } from "@liexp/io/lib/http/Common/Geometry/index.js";
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

    let geometry: Geometry | undefined = undefined;
    if (input.geometry) {
      try {
        const parsed = JSON.parse(input.geometry);
        geometry = Geometry.Geometry.decodeUnknownSync(parsed);
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
          type: "Point",
          coordinates: [0, 0],
        },
        draft: input.draft ?? false,
        body: [],
      },
    });
  },
);
