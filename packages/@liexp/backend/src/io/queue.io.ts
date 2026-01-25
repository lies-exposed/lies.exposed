import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import * as io from "@liexp/io/lib/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect/index";
import * as E from "fp-ts/lib/Either.js";
import { type QueueEntity } from "../entities/Queue.entity.js";
import { IOCodec } from "./DomainCodec.js";

export const toQueueIO = (
  unknownQueue: QueueEntity,
): E.Either<DecodeError, io.http.Queue.Queue> => {
  const queue = {
    ...unknownQueue,
    question: "question" in unknownQueue ? unknownQueue?.question : null,
    // data: JSON.parse(unknownQueue.data as any),
    result: unknownQueue?.result ?? null,
    prompt: unknownQueue?.prompt ?? null,
    error: unknownQueue?.error ?? null,
  };

  return pipe(
    queue,
    Schema.decodeUnknownEither(io.http.Queue.Queue),
    E.mapLeft((e) =>
      DecodeError.of(`Failed to decode queue (${JSON.stringify(queue)})`, e),
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
