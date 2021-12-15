import * as io from "@econnessione/shared/io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

export const toEventV2IO = (
  event: EventV2Entity
): E.Either<ControllerError, io.http.Events.EventV2> => {
  console.log({ event });
  return pipe(
    io.http.Events.EventV2.decode({
      ...event,
      date: new Date().toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
