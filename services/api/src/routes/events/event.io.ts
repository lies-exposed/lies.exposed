import { io } from "@econnessione/shared";
import { EventEntity } from "@entities/Event.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

export const toEventIO = (
  event: EventEntity
): E.Either<ControllerError, io.http.Events.Event> => {
  return pipe(
    io.http.Events.Event.decode({
      ...event,
      type: "Uncategorized",
      location: event.location ? event.location : undefined,
      topics: [],
      startDate: event.startDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : undefined,
      date: new Date().toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
