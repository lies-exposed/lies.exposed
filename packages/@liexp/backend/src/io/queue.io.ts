import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import * as io from "@liexp/io/lib/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect/index";
import * as E from "fp-ts/lib/Either.js";
import { type QueueEntity } from "../entities/Queue.entity.js";
import { IOCodec } from "./DomainCodec.js";

/**
 * Intermediate schema that handles date conversion
 * Dates can come as ISO strings or Date objects from the database
 */
const QueueDecoderSchema = Schema.Struct({
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
  createdAt: Schema.Union(Schema.DateFromString, Schema.Date),
  updatedAt: Schema.Union(Schema.DateFromString, Schema.Date),
  deletedAt: Schema.NullOr(Schema.Union(Schema.DateFromString, Schema.Date)),
});

export const toQueueIO = (
  unknownQueue: QueueEntity | Record<string, unknown>,
): E.Either<DecodeError, io.http.Queue.Queue> => {
  return pipe(
    unknownQueue,
    Schema.decodeUnknownEither(QueueDecoderSchema),
    E.mapLeft((e) =>
      DecodeError.of(
        `Failed to decode queue dates (${JSON.stringify(unknownQueue)})`,
        e,
      ),
    ),
    E.chain((decoded) =>
      pipe(
        decoded,
        Schema.decodeUnknownEither(io.http.Queue.Queue),
        E.mapLeft((e) =>
          DecodeError.of(
            `Failed to decode queue against Queue schema (${JSON.stringify(unknownQueue)})`,
            e,
          ),
        ),
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
