import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import * as io from "@liexp/io/lib/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect/index";
import * as E from "fp-ts/lib/Either.js";
import { type QueueEntity } from "../entities/Queue.entity.js";
import { IOCodec } from "./DomainCodec.js";

/**
 * Queue IO decoder that handles ISO date strings from API responses
 * Uses Schema.DateFromString to transform string dates to Date objects
 */
const QueueDecoder = Schema.Struct({
  id: Schema.String,
  result: Schema.Union(Schema.String, Schema.Null, Schema.Any),
  prompt: Schema.Union(Schema.String, Schema.Null),
  resource: Schema.String,
  status: Schema.String,
  error: Schema.Union(
    Schema.Record({ key: Schema.String, value: Schema.Any }),
    Schema.Null,
  ),
  type: Schema.String,
  data: Schema.Any,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
  deletedAt: Schema.NullOr(Schema.DateFromString),
});

export const toQueueIO = (
  unknownQueue: QueueEntity | Record<string, unknown>,
): E.Either<DecodeError, io.http.Queue.Queue> => {
  return pipe(
    unknownQueue,
    Schema.decodeUnknownEither(QueueDecoder),
    E.chain((decoded) =>
      pipe(
        decoded,
        Schema.decodeUnknownEither(io.http.Queue.Queue),
      ),
    ),
    E.mapLeft((e) =>
      DecodeError.of(
        `Failed to decode queue (${JSON.stringify(unknownQueue)})`,
        e,
      ),
    ),
  );
};

export const QueueIO = IOCodec(
  io.http.Queue.Queue,
  {
    decode: toQueueIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "queue",
);
