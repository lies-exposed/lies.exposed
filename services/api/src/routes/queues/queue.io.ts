import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { DecodeError, type ControllerError } from "#io/ControllerError.js";

export const toQueueIO = (
  queue: Record<string, unknown>,
): E.Either<ControllerError, io.http.Queue.Queue> => {
  return pipe(
    io.http.Queue.Queue.decode({
      status: "pending",
      ...queue,
      error: queue?.error ?? null,
    }),
    E.mapLeft((e) =>
      DecodeError(`Failed to decode queue (${JSON.stringify(queue)})`, e),
    ),
  );
};
