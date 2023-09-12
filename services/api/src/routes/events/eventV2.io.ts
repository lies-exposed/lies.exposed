import * as io from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { toQuoteIO } from "./quotes/quote.io";
import { type EventV2Entity } from "@entities/Event.v2.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toEventV2IO = (
  event: EventV2Entity,
): E.Either<ControllerError, io.http.Events.Event> => {
  return pipe(
    event.type === "Quote" ? toQuoteIO(event) : E.right(event as any),
    E.chain((event) =>
      pipe(
        io.http.Events.Event.decode({
          ...event,
          excerpt: event.excerpt ?? undefined,
          body: event.body ?? undefined,
          date: event.date.toISOString(),
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
