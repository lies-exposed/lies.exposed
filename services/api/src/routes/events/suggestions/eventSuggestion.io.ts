import { type EventSuggestionEntity } from "@liexp/backend/lib/entities/EventSuggestion.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type ControllerError } from "#io/ControllerError.js";

export const toEventSuggestion = (
  event: EventSuggestionEntity,
): E.Either<ControllerError, io.http.EventSuggestion.EventSuggestion> => {
  const { links, newLinks } = event.payload.event.links.reduce(
    (acc, l) => {
      if (typeof l === "string") {
        return {
          ...acc,
          links: acc.links.concat(l as any),
        };
      }
      if (Schema.is(UUID)((l as any).id)) {
        return {
          ...acc,
          links: acc.links.concat((l as any).id),
        };
      }
      return {
        ...acc,
        newLinks: acc.newLinks.concat({
          ...(l as any),
          fromURL: true,
        }),
      };
    },
    {
      links: [],
      newLinks: [],
    },
  );

  const eventEncoded = {
    ...event.payload,
    id: event.id,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
    creator: event.creator?.id,
    event: {
      ...event.payload.event,
      draft: event.payload.event.draft ?? true,
      date:
        typeof event.payload.event.date === "object"
          ? event.payload.event.date.toISOString()
          : event.payload.event.date,
      media: [],
      links,
      newLinks: (event.payload.event.newLinks ?? []).concat(newLinks),
    },
  };

  return pipe(
    {
      ...event,
      creator: event.creator?.id,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      deletedAt: event.deletedAt?.toISOString(),
      payload: eventEncoded,
    },
    Schema.decodeUnknownEither(io.http.EventSuggestion.EventSuggestion),
    E.mapLeft((e) =>
      DecodeError.of(`Failed to decode Event Suggestion (${event.id})`, e),
    ),
  );
};
