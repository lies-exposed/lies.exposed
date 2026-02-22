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
  return pipe(
    E.Do,
    E.bind("queue", () => {
      const q = unknownQueue as any;
      return E.right({
        id: q.id,
        result: q.result ?? null,
        prompt: q.prompt ?? null,
        resource: q.resource,
        status: q.status,
        error: q.error ?? null,
        type: q.type,
        data: q.data,
        createdAt: q.createdAt instanceof Date ? q.createdAt : new Date(q.createdAt),
        updatedAt: q.updatedAt instanceof Date ? q.updatedAt : new Date(q.updatedAt),
        deletedAt: q.deletedAt ? (q.deletedAt instanceof Date ? q.deletedAt : new Date(q.deletedAt)) : null,
      });
    }),
    E.chain(({ queue }) =>
      pipe(
        queue,
        Schema.decodeUnknownEither(io.http.Queue.Queue),
        E.mapLeft((e) =>
          DecodeError.of(
            `Failed to decode queue (${JSON.stringify(unknownQueue)})`,
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
