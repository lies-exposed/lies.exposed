import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { BySubjectId } from "@liexp/shared/lib/io/http/Common/BySubject.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { QUOTE } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type CreateQuoteBody } from "@liexp/shared/lib/io/http/Events/Quote.js";
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

export const CreateQuoteEventInputSchema = Schema.Struct({
  ...baseEventSchema.fields,
  actor: Schema.NullOr(UUID).annotations({
    description: "UUID of the actor who made the quote or null",
  }),
  subject: Schema.NullOr(BySubjectId).annotations({
    description: "Subject of the quote or null",
  }),
  quote: Schema.NullOr(Schema.String).annotations({
    description: "The quote text itself or null",
  }),
  details: Schema.NullOr(Schema.String).annotations({
    description: "Additional details or context about the quote or null",
  }),
});
export type CreateQuoteEventInputSchema =
  typeof CreateQuoteEventInputSchema.Type;

export const createQuoteEventToolTask = ({
  date,
  draft,
  excerpt,
  body,
  media,
  links,
  keywords,
  actor,
  subject,
  quote,
  details,
}: CreateQuoteEventInputSchema) => {
  const eventBody: CreateQuoteBody = {
    type: QUOTE.literals[0],
    date: new Date(date),
    draft,
    excerpt: excerpt ? toInitialValue(excerpt) : undefined,
    body: body ? toInitialValue(body) : undefined,
    media: media ?? [],
    links: links ?? [],
    keywords: keywords ?? [],
    payload: {
      actor: actor ?? undefined,
      subject: subject ?? undefined,
      quote: quote ?? undefined,
      details: details ?? undefined,
    },
  };

  return pipe(
    createEvent(eventBody),
    LoggerService.RTE.debug("Created quote event %O"),
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
