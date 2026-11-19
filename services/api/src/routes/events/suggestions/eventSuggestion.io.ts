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
  const SuggestionNewLinkInputSchema = Schema.Struct({
    url: Schema.String,
    publishDate: Schema.optional(
      Schema.Union(Schema.Date, Schema.String, Schema.Null),
    ),
  });

  const SuggestionLinkInputSchema = Schema.Struct({
    id: Schema.optional(UUID),
    url: Schema.optional(Schema.String),
    publishDate: Schema.optional(
      Schema.Union(Schema.Date, Schema.String, Schema.Null),
    ),
  });

  const SuggestionEventSchema = Schema.Struct({
    links: Schema.Array(
      Schema.Union(UUID, SuggestionLinkInputSchema).annotations({
        title: "StoredSuggestionLink",
      }),
    ),
    newLinks: Schema.optional(Schema.Array(SuggestionNewLinkInputSchema)),
  });

  type StoredSuggestionLink =
    (typeof SuggestionEventSchema.Type)["links"][number];
  type SuggestionLinkInputType = typeof SuggestionLinkInputSchema.Type;
  interface NewLinkOutput {
    url: string;
    publishDate: Date | string | null;
    fromURL: true;
  }

  const isUuidId = (l: StoredSuggestionLink): l is { id: UUID } =>
    typeof l === "object" && "id" in l && l.id !== undefined;

  const linkToNewLink = (l: SuggestionLinkInputType): NewLinkOutput => ({
    url: l.url ?? "",
    publishDate: l.publishDate ?? null,
    fromURL: true as const,
  });

  const decodeSuggestionEvent = pipe(
    event.payload.event,
    Schema.decodeUnknownEither(SuggestionEventSchema),
    E.mapLeft((e) =>
      DecodeError.of(
        `Failed to decode Event Suggestion payload (${event.id})`,
        e,
      ),
    ),
  );

  const buildEventEncoded = (
    suggestionEvent: typeof SuggestionEventSchema.Type,
  ): unknown => {
    const { links, newLinks } = suggestionEvent.links.reduce<{
      links: UUID[];
      newLinks: NewLinkOutput[];
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
        // a stored link entry without id and without url is invalid: drop it
        return l.url === undefined
          ? acc
          : {
              ...acc,
              newLinks: acc.newLinks.concat(linkToNewLink(l)),
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
        newLinks: (suggestionEvent.newLinks ?? [])
          .map((nl): NewLinkOutput => ({
            url: nl.url,
            publishDate: nl.publishDate ?? null,
            fromURL: true as const,
          }))
          .concat(newLinks),
      },
    };

    return eventEncoded;
  };

  return pipe(
    decodeSuggestionEvent,
    E.chain((suggestionEvent) =>
      pipe(
        {
          ...event,
          creator: event.creator?.id,
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
          deletedAt: event.deletedAt?.toISOString(),
          payload: buildEventEncoded(suggestionEvent),
        },
        Schema.decodeUnknownEither(io.http.EventSuggestion.EventSuggestion),
        E.mapLeft((e) =>
          DecodeError.of(`Failed to decode Event Suggestion (${event.id})`, e),
        ),
      ),
    ),
  );
};
