import * as io from "@liexp/shared/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { type EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toEventSuggestion = (
  event: EventSuggestionEntity
): E.Either<
  ControllerError,
  { id: string; payload: io.http.EventSuggestion.EventSuggestion }
> => {
  const { links, newLinks } = event.payload.event.links.reduce(
    (acc, l) => {
      if (typeof l === "string") {
        return {
          ...acc,
          links: acc.links.concat(l as any),
        };
      }
      if (UUID.is((l as any).id)) {
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
    }
  );

  const eventEncoded = {
    ...event.payload,
    id: event.id,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
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
    io.http.EventSuggestion.EventSuggestion.decode(eventEncoded),
    E.map((payload) => ({
      ...event,
      payload,
    })),
    E.mapLeft((e) =>
      DecodeError(`Failed to decode Event Suggestion (${event.id})`, e)
    )
  );
};
