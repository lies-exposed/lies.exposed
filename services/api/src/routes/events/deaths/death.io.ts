import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type DeathEventViewEntity } from "#entities/events/DeathEvent.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";
import { IOCodec } from "#io/DomainCodec.js";

const toDeathIO = (
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

export const DeathIO = IOCodec(toDeathIO, "death");
