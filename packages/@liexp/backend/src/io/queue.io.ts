import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import * as io from "@liexp/io/lib/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect/index";
import * as E from "fp-ts/lib/Either.js";
import { type QueueEntity } from "../entities/Queue.entity.js";
import { IOCodec } from "./DomainCodec.js";

export const toQueueIO = (
  unknownQueue: QueueEntity | Record<string, unknown>,
): E.Either<DecodeError, io.http.Queue.Queue> => {
  const q = unknownQueue as any;
  
  // Convert ISO string dates to Date objects
  const queue = {
    ...q,
    createdAt: typeof q.createdAt === "string" ? new Date(q.createdAt) : q.createdAt,
    updatedAt: typeof q.updatedAt === "string" ? new Date(q.updatedAt) : q.updatedAt,
    deletedAt: q.deletedAt ? (typeof q.deletedAt === "string" ? new Date(q.deletedAt) : q.deletedAt) : null,
  };

  return pipe(
    queue,
    Schema.decodeUnknownEither(io.http.Queue.Queue),
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
