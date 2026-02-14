import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import {
  EditEventTypeAndPayload,
  EventType,
} from "@liexp/io/lib/http/Events/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { Schema } from "effect";
import * as O from "effect/Option";
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
  // Process payload to transform and wrap fields appropriately based on event type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let processedPayload: any = { ...payload };

  // Transform payload based on event type
  if (payload.type === "Book") {
    // Book converts pdfMediaId/audioMediaId to media.pdf/media.audio structure
    processedPayload = {
      title: payload.title,
      media: {
        pdf: payload.pdfMediaId,
        audio: payload.audioMediaId ?? undefined,
      },
      authors: payload.authors ?? [],
      publisher: payload.publisher ?? undefined,
    };
  } else if (payload.type === "Uncategorized") {
    // Wrap optional fields that require Option types
    processedPayload = {
      ...payload,
      location: O.fromNullable(payload.location),
      endDate: O.fromNullable(payload.endDate),
    };
  } else if (payload.type === "Death") {
    // Wrap location as Option
    processedPayload = {
      ...payload,
      location: O.fromNullable(payload.location),
    };
  } else if (payload.type === "Documentary") {
    // Documentary has media and complex authors/subjects structures
    processedPayload = {
      title: payload.title,
      media: payload.media,
      website: payload.website ?? undefined,
      authors: {
        actors: payload.authors?.actors ?? [],
        groups: payload.authors?.groups ?? [],
      },
      subjects: {
        actors: payload.subjects?.actors ?? [],
        groups: payload.subjects?.groups ?? [],
      },
    };
  } else if (payload.type === "ScientificStudy") {
    // ScientificStudy expects url as a UUID
    processedPayload = {
      title: payload.title,
      authors: payload.authors ?? [],
      publisher: payload.publisher ?? undefined,
      url: payload.url, // Should be UUID
      image: payload.image ?? undefined,
    };
  } else if (payload.type === "Patent") {
    // Patent expects owners with actors/groups structure
    processedPayload = {
      title: payload.title,
      owners: {
        actors: payload.inventors ?? [],
        groups: [],
      },
      source: payload.assignee ?? undefined,
    };
  } else if (payload.type === "Quote") {
    // Quote passes through as-is
    processedPayload = {
      details: payload.details,
      subject: payload.subject ?? undefined,
    };
  } else if (payload.type === "Transaction") {
    // Transaction expects from/to as BySubjectId objects and total as number
    processedPayload = {
      title: payload.title,
      total:
        typeof payload.amount === "string"
          ? parseFloat(payload.amount)
          : payload.amount,
      currency: payload.currency,
      from: payload.from ?? { type: "Actor" as const, id: "" },
      to: payload.to ?? { type: "Actor" as const, id: "" },
    };
  }

  // Map the discriminated union payload to create appropriate event body
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventBody: any = {
    type,
    date: new Date(date),
    draft,
    excerpt: excerpt ? toInitialValue(excerpt) : undefined,
    body: bodyContent ? toInitialValue(bodyContent) : undefined,
    media: media ?? [],
    links: links ?? [],
    keywords: keywords ?? [],
    payload: processedPayload,
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
