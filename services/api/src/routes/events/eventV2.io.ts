import * as io from "@econnessione/shared/io";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toEventV2IO = (
  event: EventV2Entity
): E.Either<ControllerError, io.http.Events.Event> => {
  return pipe(
    io.http.Events.Event.decode({
      ...event,
      body: event.body ?? undefined,
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode event (${event.id})`, e))
  );
};
