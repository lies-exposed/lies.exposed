import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import {
  EditEventTypeAndPayload,
  EventType,
} from "@liexp/io/lib/http/Events/index.js";
import { Schema } from "effect";
import type * as RTE from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import type { ServerContext } from "../../../../context/context.type.js";
import { createEvent } from "../../../../flows/events/createEvent.flow.js";
import { formatEventToMarkdown } from "../formatters/eventToMarkdown.formatter.js";
import { baseEventSchema } from "./eventHelpers.js";

/**
 * Unified schema for creating any event type
 * Uses discriminated union pattern matching EditEventTypeAndPayload
 */
export const CreateUnifiedEventInputSchema = Schema.Struct({
  ...baseEventSchema.fields,
  type: EventType.annotations({
    description:
      "Event type: Book, Death, Patent, ScientificStudy, Uncategorized, Documentary, Transaction, or Quote",
  }),
  payload: EditEventTypeAndPayload.annotations({
    description:
      "Type-discriminated payload. Structure varies based on the event type. Each type includes a type field and type-specific payload fields.",
  }),
});

export type CreateUnifiedEventInputSchema =
  typeof CreateUnifiedEventInputSchema.Type;

/**
 * Unified event creation handler supporting all 8 event types
 * Maps the discriminated union payload to the appropriate event creation flow
 */
export const createUnifiedEventToolTask = ({
  date,
  draft,
  excerpt,
  body: bodyContent,
  media,
  links,
  keywords,
  type,
  payload,
}: CreateUnifiedEventInputSchema): RTE.ReaderTaskEither<
  ServerContext,
  Error,
  {
    content: {
      type: "text";
      text: string;
      uri?: string;
    }[];
  }
> => {
  // Map the discriminated union payload to create appropriate event body
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventBody: any = {
    type,
    date: new Date(date),
    draft,
    excerpt: excerpt ?? undefined,
    body: bodyContent ?? undefined,
    media: media ?? [],
    links: links ?? [],
    keywords: keywords ?? [],
    payload,
  };

  return pipe(
    createEvent(eventBody),
    LoggerService.RTE.debug("Created unified event %O"),
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
