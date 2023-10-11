import * as io from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type EventV2Entity } from "@entities/Event.v2.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toQuoteIO = (
  event: EventV2Entity,
): E.Either<ControllerError, io.http.Events.Quote.Quote> => {
  const p: any = event.payload;
  return pipe(
    io.http.Events.Quote.Quote.decode({
      ...event,
      payload: {
        ...event.payload,
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
