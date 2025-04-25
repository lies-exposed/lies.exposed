import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type ControllerError } from "#io/ControllerError.js";

export const toQueueIO = (
  unknownQueue: Record<string, unknown>,
): E.Either<ControllerError, io.http.Queue.Queue> => {
  const queue = {
    status: "pending",
    ...unknownQueue,
    data:
      "data" in unknownQueue &&
      !!unknownQueue.data &&
      typeof unknownQueue.data === "object" &&
      "date" in unknownQueue.data
        ? {
            ...unknownQueue.data,
            date:
              typeof unknownQueue.data?.date === "string"
                ? unknownQueue.data.date
                : unknownQueue.data?.date instanceof Date
                  ? unknownQueue.data.date.toISOString()
                  : null,
          }
        : null,
    question: unknownQueue?.question ?? null,
    result: unknownQueue?.result ?? null,
    prompt: unknownQueue?.prompt ?? null,
    error: unknownQueue?.error ?? null,
  };
  return pipe(
    Schema.decodeUnknownEither(io.http.Queue.Queue)(queue),
    E.mapLeft((e) =>
      DecodeError.of(`Failed to decode queue (${JSON.stringify(queue)})`, e),
    ),
  );
};
