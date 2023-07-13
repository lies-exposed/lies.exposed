import * as io from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type DeathEventViewEntity } from "@entities/events/DeathEvent.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toDeathIO = (
  event: DeathEventViewEntity,
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
      DecodeError(`Failed to decode death event (${event.id})`, e),
    ),
  );
};
