import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { type DeathPayload } from "@liexp/shared/lib/io/http/Events/Death.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { IOCodec } from "../DomainCodec.js";

const toDeathIO = (
  event: EventV2Entity,
): E.Either<_DecodeError, io.http.Events.Death.Death> => {
  const payload = event.payload as DeathPayload;
  return pipe(
    {
      ...event,
      type: "Death",
      victim: payload.victim,
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
