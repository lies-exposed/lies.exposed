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

const toQuoteIO = (
  event: EventV2Entity,
): E.Either<_DecodeError, io.http.Events.Quote.Quote> => {
  const p: any = event.payload;
  return pipe(
    {
      ...event,
      payload: {
        ...p,
        actor: undefined,
        subject: p.subject ?? { type: "Actor", id: p.actor },
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

export const QuoteIO = IOCodec(toQuoteIO, "quote");
