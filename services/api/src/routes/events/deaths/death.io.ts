import * as io from "@econnessione/shared/io";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { DeathEventEntity } from "@entities/DeathEvent.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toDeathIO = (
  event: DeathEventEntity
): E.Either<ControllerError, io.http.Events.Death.Death> => {
  return pipe(
    io.http.Events.Death.Death.decode({
      ...event,
      type: "Death",
      victim: event.victim,
      location: event.location ? event.location : undefined,
      date: event.date.toISOString(),
      news: [],
      media: [],
      suspects: [],
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
