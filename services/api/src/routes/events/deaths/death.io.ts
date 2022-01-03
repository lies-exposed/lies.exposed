import * as io from "@econnessione/shared/io";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { DeathEntity } from "@entities/events/DeathEvent.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toDeathIO = (
  event: DeathEntity
): E.Either<ControllerError, io.http.Events.Death.Death> => {
  return pipe(
    io.http.Events.Death.Death.decode({
      ...event,
      type: "Death",
      victim: event.victim,
      date: event.date.toISOString(),
      news: [],
      media: [],
      suspects: [],
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }),
    E.mapLeft((e) =>
      DecodeError(`Failed to decode death event (${event.id})`, e)
    )
  );
};
