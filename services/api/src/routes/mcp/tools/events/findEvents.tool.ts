import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { formatEventToMarkdown } from "../formatters/eventToMarkdown.formatter.js";

export const FindEventsInputSchema = Schema.Struct({
  query: Schema.NullOr(Schema.String).annotations({
    description: "Search query string to filter events or null",
  }),
  actors: Schema.Array(UUID).annotations({
    description: "Array of actor UUIDs involved in the event",
  }),
  groups: Schema.Array(UUID).annotations({
    description: "Array of group UUIDs involved in the event",
  }),
  type: Schema.NullOr(EventType).annotations({
    description: "Type of the event or null",
  }),
});
export type FindEventsInputSchema = typeof FindEventsInputSchema.Type;

export const findEventsToolTask = ({
  query,
  actors,
  groups,
  type,
}: FindEventsInputSchema) => {
  return pipe(
    searchEventV2Query({
      q: O.fromNullable(query),
      actors: pipe(
        actors,
        O.fromNullable,
        O.filter((actors) => actors.length > 0),
      ),
      groups: pipe(
        groups,
        O.fromNullable,
        O.filter((groups) => groups.length > 0),
      ),
      type: O.fromNullable(type ? [type] : undefined),
    }),
    fp.RTE.chainEitherK((result) => EventV2IO.decodeMany(result.results)),
    LoggerService.RTE.debug(`Results %O`),
    fp.RTE.map((events) => {
      if (events.length === 0) {
        return {
          content: [
            {
              text: `No events found matching the search criteria${query ? ` for "${query}"` : ""}.`,
              type: "text" as const,
            },
          ],
        };
      }
      return {
        content: events.map((eventResult) => {
          return {
            text: formatEventToMarkdown(eventResult),
            uri: `event://${eventResult.id}`,
            type: "text" as const,
          };
        }),
      };
    }),
  );
};
