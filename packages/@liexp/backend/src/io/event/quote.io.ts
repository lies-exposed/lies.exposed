import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { type QuotePayload } from "@liexp/shared/lib/io/http/Events/Quote.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { IOCodec } from "../DomainCodec.js";

const toQuoteIO = (
  event: EventV2Entity,
): E.Either<_DecodeError, io.http.Events.Quote.Quote> => {
  const p = event.payload as QuotePayload;
  return pipe(
    {
      ...event,
      payload: {
        ...p,
        actor: undefined,
        subject:
          p.subject ?? (p.actor && { type: "Actor", id: p.actor }) ?? undefined,
      },
      excerpt: event.excerpt ?? undefined,
      body: event.body ?? undefined,
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      deletedAt: event.deletedAt?.toISOString() ?? undefined,
    },
    Schema.decodeUnknownEither(io.http.Events.Quote.Quote),
    E.mapLeft((e) => DecodeError.of(`Failed to decode event (${event.id})`, e)),
  );
};

export const QuoteIO = IOCodec(
  io.http.Events.Quote.Quote,
  {
    decode: toQuoteIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "quote",
);
