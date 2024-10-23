import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { BookIO } from "./books/book.io.js";
import { DocumentaryIO } from "./documentary/documentary.io.js";
import { QuoteIO } from "./quotes/quote.io.js";
import { type EventV2Entity } from "#entities/Event.v2.entity.js";
import { type ControllerError } from "#io/ControllerError.js";
import { IOCodec } from "#io/DomainCodec.js";

const toEventV2IO = (
  event: EventV2Entity,
): E.Either<ControllerError, io.http.Events.Event> => {
  return pipe(
    E.Do,
    E.bind("eventSpecs", () => {
      if (event.type === io.http.Events.EventTypes.QUOTE.value) {
        return QuoteIO.decodeSingle(event);
      }
      if (event.type === io.http.Events.EventTypes.DOCUMENTARY.value) {
        return DocumentaryIO.decodeSingle(event);
      }
      if (event.type === io.http.Events.EventTypes.BOOK.value) {
        return BookIO.decodeSingle(event);
      }
      return E.right(event as any);
    }),
    E.chain(({ eventSpecs }) =>
      pipe(
        io.http.Events.Event.decode({
          ...eventSpecs,
          excerpt: event.excerpt ?? undefined,
          body: event.body ?? undefined,
          date: event.date.toISOString(),
          socialPosts: event.socialPosts ?? [],
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
          deletedAt: event.deletedAt?.toISOString() ?? undefined,
        }),
        E.mapLeft((e) =>
          DecodeError.of(`Failed to decode event (${event.id})`, e),
        ),
      ),
    ),
  );
};

export const EventV2IO = IOCodec(toEventV2IO, "event");
