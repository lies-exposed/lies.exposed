import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import { type Event } from "@liexp/io/lib/http/Events/index.js";
import * as io from "@liexp/io/lib/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { IOCodec } from "../DomainCodec.js";
import { BookIO } from "./book.io.js";
import { DocumentaryIO } from "./documentary.io.js";
import { QuoteIO } from "./quote.io.js";

const decodeEvent = (
  event: EventV2Entity,
): E.Either<DecodeError, io.http.Events.Event> => {
  return pipe(
    E.Do,
    E.bind("eventSpecs", (): E.Either<DecodeError, Event | EventV2Entity> => {
      if (event.type === EVENT_TYPES.QUOTE) {
        return QuoteIO.decodeSingle(event);
      }
      if (event.type === EVENT_TYPES.DOCUMENTARY) {
        return DocumentaryIO.decodeSingle(event);
      }
      if (event.type === EVENT_TYPES.BOOK) {
        return BookIO.decodeSingle(event);
      }
      return E.right(event);
    }),
    E.chain(({ eventSpecs }) =>
      pipe(
        {
          ...eventSpecs,
          excerpt: event.excerpt ?? undefined,
          body: event.body ?? undefined,
          socialPosts: event.socialPosts ?? [],
          deletedAt: event.deletedAt ?? undefined,
        },
        Schema.validateEither(io.http.Events.Event),
        E.mapLeft((e) =>
          DecodeError.of(`Failed to decode event (${event.id})`, e),
        ),
      ),
    ),
  );
};

export const EventV2IO = IOCodec(
  io.http.Events.Event,
  {
    decode: decodeEvent,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "event",
);
