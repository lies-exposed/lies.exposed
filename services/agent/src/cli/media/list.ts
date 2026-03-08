import { FindMediaInputSchema } from "@liexp/shared/lib/mcp/schemas/media.schemas.js";
import { makeCommand } from "../run-command.js";

export const mediaList = makeCommand(
  FindMediaInputSchema,
  { usage: "media list", description: "Search and list media (images, videos, files).", output: "JSON list of media objects" },
  (input, ctx) => {
    ctx.logger.debug.log("media list input: %O", input);
    return ctx.api.Media.List({
      Query: {
        q: input.query,
        _sort: input.sort,
        _order: input.order,
        _start: input.start !== undefined ? String(input.start) : "0",
        _end: input.end !== undefined ? String(input.end) : "20",
      } as any,
    });
  },
);
