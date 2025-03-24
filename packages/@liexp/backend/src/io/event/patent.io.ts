import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { IOError } from "ts-io-error";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { IOCodec } from "../DomainCodec.js";

const decodePatent = (
  event: EventV2Entity,
): E.Either<_DecodeError, io.http.Events.Patent.Patent> => {
  const p: any = event.payload;
  return pipe(
    {
      ...event,
      payload: {
        ...p,
        website: p?.website ?? undefined,
      },
      excerpt: event.excerpt ?? undefined,
      body: event.body ?? undefined,
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      deletedAt: event.deletedAt?.toISOString() ?? undefined,
    },
    Schema.decodeUnknownEither(io.http.Events.Patent.Patent),
    E.mapLeft((e) => DecodeError.of(`Failed to decode event (${event.id})`, e)),
  );
};

export const PatentIO = IOCodec(
  io.http.Events.Patent.Patent,
  {
    decode: decodePatent,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "documentary",
);
