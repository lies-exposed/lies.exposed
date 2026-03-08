import { FindEventsInputSchema } from "@liexp/shared/lib/mcp/schemas/events.schemas.js";
import { makeCommand } from "../run-command.js";

export const eventList = makeCommand(
  FindEventsInputSchema,
  { usage: "event list", description: "Search and list fact-checked events.", output: "JSON list of event objects" },
  (input, ctx) => {
    ctx.logger.debug.log("event list input: %O", input);
    return ctx.api.Event.List({
      Query: {
        q: input.query ?? null,
        actors: input.actors as any,
        groups: input.groups as any,
        type: input.type ? [input.type as any] : undefined,
        startDate: input.startDate,
        endDate: input.endDate,
        _start: input.start !== undefined ? String(input.start) : "0",
        _end: input.end !== undefined ? String(input.end) : "20",
      } as any,
    });
  },
);
