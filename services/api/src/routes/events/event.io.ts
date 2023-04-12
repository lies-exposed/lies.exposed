import * as io from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { type EventEntity } from "@entities/archive/Event.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toEventIO = (
  event: EventEntity
): E.Either<ControllerError, io.http.Events.Event> => {
  return pipe(
    io.http.Events.Event.decode({
      ...event,
      type: "Uncategorized",
      location: event.location ? event.location : undefined,
      topics: [],
      media: event.media.map((m) =>
        UUID.is(m)
          ? m
          : {
              ...m,
              thumbnail: m.thumbnail ?? undefined,
            }
      ),
      startDate: event.startDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : undefined,
      date: new Date().toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      deletedAt: event.deletedAt?.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode event (${event.id})`, e))
  );
};
