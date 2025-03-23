import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { IOCodec } from "../DomainCodec.js";
import { BookIO } from "./book.io.js";
import { DocumentaryIO } from "./documentary.io.js";
import { QuoteIO } from "./quote.io.js";

const toEventV2IO = (
  event: EventV2Entity,
): E.Either<_DecodeError, io.http.Events.Event> => {
  return pipe(
    E.Do,
    E.bind("eventSpecs", () => {
      if (event.type === io.http.Events.EventTypes.QUOTE.Type) {
        return QuoteIO.decodeSingle(event);
      }
      if (event.type === io.http.Events.EventTypes.DOCUMENTARY.Type) {
        return DocumentaryIO.decodeSingle(event);
      }
      if (event.type === io.http.Events.EventTypes.BOOK.Type) {
        return BookIO.decodeSingle(event);
      }
      return E.right(event as any);
    }),
    E.chain(({ eventSpecs }) =>
      pipe(
        {
          ...eventSpecs,
          excerpt: event.excerpt ?? undefined,
          body: event.body ?? undefined,
          date: event.date.toISOString(),
          socialPosts: event.socialPosts ?? [],
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
          deletedAt: event.deletedAt?.toISOString() ?? undefined,
        },
        Schema.decodeUnknownEither(io.http.Events.Event),
        E.mapLeft((e) =>
          DecodeError.of(`Failed to decode event (${event.id})`, e),
        ),
      ),
    ),
  );
};

export const EventV2IO = IOCodec(toEventV2IO, "event");
