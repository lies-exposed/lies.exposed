import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CreateBookBody } from "@liexp/shared/lib/io/http/Events/Book.js";
import { BOOK } from "@liexp/shared/lib/io/http/Events/EventType.js";
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

export const CreateBookEventInputSchema = Schema.Struct({
  ...baseEventSchema.fields,
  title: Schema.String.annotations({
    description: "Title of the book",
  }),
  pdfMediaId: UUID.annotations({
    description: "UUID of the PDF media for the book (required)",
  }),
  audioMediaId: Schema.NullOr(UUID).annotations({
    description: "UUID of the audio media for the book or null",
  }),
  authors: Schema.Array(
    Schema.Struct({
      type: Schema.Union(
        Schema.Literal("Actor"),
        Schema.Literal("Group"),
      ).annotations({
        description: 'Type of author: "Actor" or "Group"',
      }),
      id: UUID.annotations({
        description: "UUID of the actor or group",
      }),
    }),
  ).annotations({
    description: "Array of authors (actors or groups) with their IDs",
  }),
  publisher: Schema.NullOr(
    Schema.Struct({
      type: Schema.Union(
        Schema.Literal("Actor"),
        Schema.Literal("Group"),
      ).annotations({
        description: 'Type of publisher: "Actor" or "Group"',
      }),
      id: UUID.annotations({
        description: "UUID of the publisher actor or group",
      }),
    }),
  ).annotations({
    description: "Publisher information or null",
  }),
});
export type CreateBookEventInputSchema = typeof CreateBookEventInputSchema.Type;

export const createBookEventToolTask = ({
  date,
  draft,
  excerpt,
  body,
  media,
  links,
  keywords,
  title,
  pdfMediaId,
  audioMediaId,
  authors,
  publisher,
}: CreateBookEventInputSchema) => {
  const eventBody: CreateBookBody = {
    type: BOOK.literals[0],
    date: new Date(date),
    draft,
    excerpt: excerpt ? toInitialValue(excerpt) : undefined,
    body: body ? toInitialValue(body) : undefined,
    media: media ?? [],
    links: links ?? [],
    keywords: keywords ?? [],
    payload: {
      title,
      media: {
        pdf: pdfMediaId,
        audio: audioMediaId ?? undefined,
      },
      authors,
      publisher: publisher ?? undefined,
    },
  };

  return pipe(
    createEvent(eventBody),
    LoggerService.RTE.debug("Created book event %O"),
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
