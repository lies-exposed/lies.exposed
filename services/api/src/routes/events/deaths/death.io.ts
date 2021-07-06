import * as io from "@econnessione/shared/io";
import { DeathEventEntity } from "@entities/DeathEvent.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

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
      images: [],
      suspects: [],
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
