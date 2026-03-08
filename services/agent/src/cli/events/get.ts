import { GetEventInputSchema } from "@liexp/shared/lib/mcp/schemas/events.schemas.js";
import { makeCommand } from "../run-command.js";

export const eventGet = makeCommand(
  GetEventInputSchema,
  { usage: "event get", description: "Retrieve an event by UUID.", output: "JSON event object" },
  (input, ctx) => {
    ctx.logger.debug.log("event get input: %O", input);
    return ctx.api.Event.Get({ Params: { id: input.id as any } });
  },
);
