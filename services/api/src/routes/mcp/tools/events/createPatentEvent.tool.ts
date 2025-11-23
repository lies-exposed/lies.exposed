import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { PATENT } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type CreatePatentBody } from "@liexp/shared/lib/io/http/Events/Patent.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { Schema } from "effect";
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

export const CreatePatentEventInputSchema = Schema.Struct({
  ...baseEventSchema.fields,
  title: Schema.String.annotations({
    description: "Title of the patent",
  }),
  ownerActors: Schema.Array(UUID).annotations({
    description: "Array of actor UUIDs who own the patent",
  }),
  ownerGroups: Schema.Array(UUID).annotations({
    description: "Array of group UUIDs who own the patent",
  }),
  source: UUID.annotations({
    description: "UUID of the source/reference for the patent",
  }),
});
export type CreatePatentEventInputSchema =
  typeof CreatePatentEventInputSchema.Type;

export const createPatentEventToolTask = ({
  date,
  draft,
  excerpt,
  body,
  media,
  links,
  keywords,
  title,
  ownerActors,
  ownerGroups,
  source,
}: CreatePatentEventInputSchema) => {
  const eventBody: CreatePatentBody = {
    type: PATENT.literals[0],
    date: new Date(date),
    draft,
    excerpt: excerpt ? toInitialValue(excerpt) : undefined,
    body: body ? toInitialValue(body) : undefined,
    media: media ?? [],
    links: links ?? [],
    keywords: keywords ?? [],
    payload: {
      title,
      owners: {
        actors: ownerActors ?? [],
        groups: ownerGroups ?? [],
      },
      source,
    },
  };

  return pipe(
    createEvent(eventBody),
    LoggerService.RTE.debug("Created patent event %O"),
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
