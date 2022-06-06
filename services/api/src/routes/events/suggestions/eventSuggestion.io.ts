import * as io from "@liexp/shared/io";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toEventSuggestion = (
  event: EventSuggestionEntity
): E.Either<
  ControllerError,
  { id: string; payload: io.http.EventSuggestion.EventSuggestion }
> => {
  const newLinks =
    event.payload.event.newLinks ??
    event.payload.event.links
      .filter((l) => typeof l !== "string")
      .map((l: any) => ({
        ...l,
        fromURL: true,
      })) ??
    [];

  const eventEncoded = {
    ...event.payload,
    event: {
      ...event.payload.event,
      draft: event.payload.event.draft ?? true,
      media: [],
      newLinks,
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
