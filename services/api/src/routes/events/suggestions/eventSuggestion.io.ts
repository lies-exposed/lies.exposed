import * as io from "@liexp/shared/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

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
    event: {
      ...event.payload.event,
      draft: event.payload.event.draft ?? true,
      media: [],
      links,
      newLinks: (event.payload.event.newLinks ?? []).concat(newLinks),
    },
  };

  return pipe(
    io.http.EventSuggestion.EventSuggestion.decode(eventEncoded),
    E.map((payload) => ({ ...event, payload })),
    E.mapLeft((e) =>
      DecodeError(`Failed to decode Event Suggestion (${event.id})`, e)
    )
  );
};
