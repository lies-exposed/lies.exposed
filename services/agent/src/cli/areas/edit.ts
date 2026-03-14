import { fp } from "@liexp/core/lib/fp/index.js";
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

    const { id, ...body } = input;
    return ctx.api.Area.Edit({
      Params: { id },
      Body: {
        ...body,
        geometry: geometry ?? undefined,
        updateGeometry: geometry !== null ? true : undefined,
        body: undefined,
      },
    });
  },
);
