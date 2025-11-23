import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { UNCATEGORIZED } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type CreateEventBody } from "@liexp/shared/lib/io/http/Events/Uncategorized.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { createEvent } from "../../../../flows/events/createEvent.flow.js";
import { formatEventToMarkdown } from "../formatters/eventToMarkdown.formatter.js";

const baseEventSchema = Schema.Struct({
  date: Schema.String.annotations({
    description: "Event date in ISO format (YYYY-MM-DD)",
  }),
  draft: Schema.Boolean.annotations({
    description: "Whether the event is a draft (true) or published (false)",
  }),
  excerpt: Schema.NullOr(Schema.String).annotations({
    description: "Short description/excerpt of the event as plain text or null",
  }),
  body: Schema.NullOr(Schema.String).annotations({
    description: "Full body/description of the event as plain text or null",
  }),
  media: Schema.Array(UUID).annotations({
    description: "Array of media UUIDs to associate with the event",
  }),
  links: Schema.Array(UUID).annotations({
    description: "Array of link UUIDs to associate with the event",
  }),
  keywords: Schema.Array(UUID).annotations({
    description: "Array of keyword UUIDs to associate with the event",
  }),
});

export const CreateUncategorizedEventInputSchema = Schema.Struct({
  ...baseEventSchema.fields,
  title: Schema.String.annotations({
    description: "Title of the event",
  }),
  actors: Schema.Array(UUID).annotations({
    description: "Array of actor UUIDs involved in the event",
  }),
  groups: Schema.Array(UUID).annotations({
    description: "Array of group UUIDs involved in the event",
  }),
  groupsMembers: Schema.Array(UUID).annotations({
    description: "Array of group member UUIDs involved in the event",
  }),
  location: Schema.UndefinedOr(UUID).annotations({
    description: "Location UUID where the event occurred or null",
  }),
  endDate: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "End date of the event in ISO format (YYYY-MM-DD) or null for single-day events",
  }),
});
export type CreateUncategorizedEventInputSchema =
  typeof CreateUncategorizedEventInputSchema.Type;

export const createUncategorizedEventToolTask = ({
  date,
  draft,
  excerpt,
  body,
  media,
  links,
  keywords,
  title,
  actors,
  groups,
  groupsMembers,
  location,
  endDate,
}: CreateUncategorizedEventInputSchema) => {
  const eventBody: CreateEventBody = {
    type: UNCATEGORIZED.literals[0],
    date: new Date(date),
    draft,
    excerpt: excerpt ? toInitialValue(excerpt) : undefined,
    body: body ? toInitialValue(body) : undefined,
    media: media ?? [],
    links: links ?? [],
    keywords: keywords ?? [],
    payload: {
      title,
      actors: actors ?? [],
      groups: groups ?? [],
      groupsMembers: groupsMembers ?? [],
      location: O.fromNullable(location),
      endDate: pipe(
        O.fromNullable(endDate),
        O.map((d) => new Date(d)),
      ),
    },
  };

  return pipe(
    createEvent(eventBody),
    LoggerService.RTE.debug("Created uncategorized event %O"),
    fp.RTE.map((event) => ({
      content: [
        {
          text: formatEventToMarkdown(event),
          type: "text" as const,
          uri: `event://${event.id}`,
        },
      ],
    })),
  );
};
