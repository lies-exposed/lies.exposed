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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookPayload = payload as any;
    // Book converts pdfMediaId/audioMediaId to media.pdf/media.audio structure
    processedPayload = {
      title: bookPayload.title,
      media: {
        pdf: bookPayload.pdfMediaId,
        audio: bookPayload.audioMediaId ?? undefined,
      },
      authors: bookPayload.authors ?? [],
      publisher: bookPayload.publisher ?? undefined,
    };
  } else if (payload.type === "Uncategorized") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uncatPayload = payload as any;
    // Wrap optional fields that require Option types
    processedPayload = {
      ...uncatPayload,
      location: O.fromNullable(uncatPayload.location),
      endDate: O.fromNullable(uncatPayload.endDate),
    };
  } else if (payload.type === "Death") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deathPayload = payload as any;
    // Wrap location as Option
    processedPayload = {
      ...deathPayload,
      location: O.fromNullable(deathPayload.location),
    };
  } else if (payload.type === "Documentary") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docPayload = payload as any;
    // Documentary has media and complex authors/subjects structures
    processedPayload = {
      title: docPayload.title,
      media: docPayload.media,
      website: docPayload.website ?? undefined,
      authors: {
        actors: docPayload.authors?.actors ?? [],
        groups: docPayload.authors?.groups ?? [],
      },
      subjects: {
        actors: docPayload.subjects?.actors ?? [],
        groups: docPayload.subjects?.groups ?? [],
      },
    };
  } else if (payload.type === "ScientificStudy") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const studyPayload = payload as any;
    // ScientificStudy expects url as a UUID
    processedPayload = {
      title: studyPayload.title,
      authors: studyPayload.authors ?? [],
      publisher: studyPayload.publisher ?? undefined,
      url: studyPayload.url, // Should be UUID
      image: studyPayload.image ?? undefined,
    };
  } else if (payload.type === "Patent") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patentPayload = payload as any;
    // Patent expects owners with actors/groups structure
    processedPayload = {
      title: patentPayload.title,
      owners: {
        actors: patentPayload.inventors ?? [],
        groups: [],
      },
      source: patentPayload.assignee ?? undefined,
    };
  } else if (payload.type === "Quote") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotePayload = payload as any;
    // Quote passes through as-is
    processedPayload = {
      details: quotePayload.details,
      subject: quotePayload.subject ?? undefined,
    };
  } else if (payload.type === "Transaction") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const txnPayload = payload as any;
    // Transaction expects from/to as BySubjectId objects and total as number
    processedPayload = {
      title: txnPayload.title,
      total:
        typeof txnPayload.amount === "string"
          ? parseFloat(txnPayload.amount)
          : txnPayload.amount,
      currency: txnPayload.currency,
      from: txnPayload.from ?? { type: "Actor" as const, id: "" },
      to: txnPayload.to ?? { type: "Actor" as const, id: "" },
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
