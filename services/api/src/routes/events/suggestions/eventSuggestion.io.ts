import { type EventSuggestionEntity } from "@liexp/backend/lib/entities/EventSuggestion.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/io/lib/http/Common/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import * as io from "@liexp/io/lib/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type ControllerError } from "#io/ControllerError.js";

export const toEventSuggestion = (
  event: EventSuggestionEntity,
): E.Either<ControllerError, io.http.EventSuggestion.EventSuggestion> => {
  interface SuggestionLinkInput {
    id?: UUID;
    url?: string;
    publishDate?: Date | null;
  }

  interface SuggestionEventInput {
    links: readonly (UUID | SuggestionLinkInput)[];
    newLinks?: { url: string; publishDate?: Date | null }[] | undefined;
  }

  const suggestionEvent = event.payload
    .event as unknown as SuggestionEventInput;

  const isUuidId = (l: UUID | SuggestionLinkInput): l is { id: UUID } =>
    typeof l === "object" && l !== null && "id" in l && Schema.is(UUID)(l.id);

  const newLinkFrom = (l: SuggestionLinkInput) => ({
    url: l.url ?? "",
    publishDate: l.publishDate ?? null,
    fromURL: true as const,
  });

  const { links, newLinks } = suggestionEvent.links.reduce<{
    links: UUID[];
    newLinks: ReturnType<typeof newLinkFrom>[];
  }>(
    (acc, l) => {
      if (typeof l === "string") {
        return {
          ...acc,
          links: acc.links.concat(l),
        };
      }
      if (isUuidId(l)) {
        return {
          ...acc,
          links: acc.links.concat(l.id),
        };
      }
      return {
        ...acc,
        newLinks: acc.newLinks.concat(newLinkFrom(l)),
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
      newLinks: (suggestionEvent.newLinks ?? []).concat(newLinks),
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
