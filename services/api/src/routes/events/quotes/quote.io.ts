import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type EventV2Entity } from "#entities/Event.v2.entity.js";
import { type ControllerError } from "#io/ControllerError.js";
import { IOCodec } from "#io/DomainCodec.js";

const toQuoteIO = (
  event: EventV2Entity,
): E.Either<ControllerError, io.http.Events.Quote.Quote> => {
  const p: any = event.payload;
  return pipe(
    io.http.Events.Quote.Quote.decode({
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
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode event (${event.id})`, e)),
  );
};

export const QuoteIO = IOCodec(toQuoteIO, "quote");
