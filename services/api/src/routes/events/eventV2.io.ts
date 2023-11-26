import * as io from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { toBookIO } from "./books/book.io";
import { toDocumentaryIO } from "./documentary/documentary.io";
import { toQuoteIO } from "./quotes/quote.io";
import { type EventV2Entity } from "@entities/Event.v2.entity";
import { DecodeError, type ControllerError } from "@io/ControllerError";

export const toEventV2IO = (
  event: EventV2Entity,
): E.Either<ControllerError, io.http.Events.Event> => {
  return pipe(
    event.type === io.http.Events.EventTypes.QUOTE.value
      ? toQuoteIO(event)
      : event.type === io.http.Events.EventTypes.DOCUMENTARY.value
      ? toDocumentaryIO(event)
      : event.type === io.http.Events.EventTypes.BOOK.value
      ? toBookIO(event)
      : E.right(event as any),
    E.chain((event) =>
      pipe(
        io.http.Events.Event.decode({
          ...event,
          excerpt: event.excerpt ?? undefined,
          body: event.body ?? undefined,
          date: event.date.toISOString(),
          socialPosts: event.socialPosts ?? [],
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
          deletedAt: event.deletedAt?.toISOString() ?? undefined,
        }),
        E.mapLeft((e) =>
          DecodeError(`Failed to decode event (${event.id})`, e),
        ),
      ),
    ),
  );
};
