import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { FindEventsInputSchema } from "@liexp/shared/lib/mcp/schemas/events.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

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
  run: async (ctx, args) => {
    const actorsArg = getArg(args, "actors");
    const groupsArg = getArg(args, "groups");
    const startArg = getArg(args, "start");
    const endArg = getArg(args, "end");

    const result = await pipe(
      Schema.decodeUnknownEither(FindEventsInputSchema)({
        query: getArg(args, "query"),
        actors: actorsArg ? [actorsArg] : undefined,
        groups: groupsArg ? [groupsArg] : undefined,
        type: getArg(args, "type"),
        startDate: getArg(args, "startDate"),
        endDate: getArg(args, "endDate"),
        start: startArg !== undefined ? Number(startArg) : undefined,
        end: endArg !== undefined ? Number(endArg) : undefined,
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
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
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("event list response: total=%d", result.total);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
