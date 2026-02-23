import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import * as io from "@liexp/io/lib/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { IOCodec } from "../DomainCodec.js";

const toScientificStudyIO = (
  event: EventV2Entity,
): E.Either<DecodeError, io.http.Events.ScientificStudy.ScientificStudy> => {
  return pipe(
    {
      ...event,
      excerpt: event.excerpt ?? undefined,
      body: event.body ?? undefined,
    },
    Schema.validateEither(io.http.Events.ScientificStudy.ScientificStudy),
    E.mapLeft((e) => DecodeError.of(`Failed to decode event (${event.id})`, e)),
  );
};

export const ScientificStudyIO = IOCodec(
  io.http.Events.ScientificStudy.ScientificStudy,
  {
    decode: toScientificStudyIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "ScientificStudy",
);
