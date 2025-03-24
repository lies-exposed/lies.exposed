import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { IOError } from "ts-io-error";
import { type DeathEventViewEntity } from "../../entities/events/DeathEvent.entity.js";
import { IOCodec } from "../DomainCodec.js";

const toDeathIO = (
  event: DeathEventViewEntity,
): E.Either<_DecodeError, io.http.Events.Death.Death> => {
  return pipe(
    {
      ...event,
      type: "Death",
      victim: event.victim,
      date: event.date.toISOString(),
      news: [],
      media: [],
      suspects: [],
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    },
    Schema.decodeUnknownEither(io.http.Events.Death.Death),
    E.mapLeft((e) =>
      DecodeError.of(`Failed to decode death event (${event.id})`, e),
    ),
  );
};

export const DeathIO = IOCodec(
  io.http.Events.Death.Death,
  {
    decode: toDeathIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "death",
);
