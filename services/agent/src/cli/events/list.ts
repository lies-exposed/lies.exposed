import { FindEventsInputSchema } from "@liexp/shared/lib/mcp/schemas/events.schemas.js";
import { makeCommand } from "../run-command.js";

export const eventList = makeCommand(
  FindEventsInputSchema,
  {
    usage: "event list",
    description: "Search and list fact-checked events.",
    output: "JSON list of event objects",
  },
  (input, ctx) => {
    ctx.logger.debug.log("event list input: %O", input);
    return ctx.api.Event.List({
      Query: {
        ...input,
        q: input.query ?? null,
        eventType: input.type ? ([input.type] as any) : undefined,
      },
    });
  },
);
