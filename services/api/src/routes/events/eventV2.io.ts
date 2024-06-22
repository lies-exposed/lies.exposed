import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/Either";
import { toBookIO } from "./books/book.io.js";
import { toDocumentaryIO } from "./documentary/documentary.io.js";
import { toQuoteIO } from "./quotes/quote.io.js";
import { type EventV2Entity } from "#entities/Event.v2.entity.js";
import { DecodeError, type ControllerError } from "#io/ControllerError.js";

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
