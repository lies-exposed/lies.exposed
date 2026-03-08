import { FindEventsInputSchema } from "@liexp/shared/lib/mcp/schemas/events.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const eventList: CommandModule = {
  help: `
Usage: agent event list [options]

Search and list fact-checked events.

Options:
  --query=<string>       Full-text search query
  --actors=<uuid>        Filter by actor UUID
  --groups=<uuid>        Filter by group UUID
  --type=<string>        Filter by type: Death | ScientificStudy | Patent | Documentary | Transaction | Book | Quote | Uncategorized
  --startDate=<date>     Events on or after YYYY-MM-DD
  --endDate=<date>       Events on or before YYYY-MM-DD
  --start=<number>       Pagination offset (default: 0)
  --end=<number>         Pagination limit (default: 20)
  --help                 Show this help message

Output: JSON list of event objects
`,
  run: (ctx, args) =>
    runCliCommand(ctx, FindEventsInputSchema, args, (input) => {
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
    }),
};
