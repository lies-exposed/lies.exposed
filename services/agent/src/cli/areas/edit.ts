import { fp } from "@liexp/core/lib/fp/index.js";
import { type Geometry } from "@liexp/io/lib/http/Common/Geometry/index.js";
import { EditAreaInputSchema } from "@liexp/shared/lib/mcp/schemas/areas.schemas.js";
import { makeCommand } from "../run-command.js";

export const areaEdit = makeCommand(
  EditAreaInputSchema,
  {
    usage: "area edit",
    description: "Edit an existing geographic area by UUID.",
    output: "JSON updated area object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("area edit input: %O", input);

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

    const { id, ...body } = input;
    return ctx.api.Area.Edit({
      Params: { id },
      Body: {
        ...body,
        ...(geometry !== undefined && { geometry }),
        updateGeometry: geometry !== undefined,
        body: undefined,
      },
    });
  },
);
