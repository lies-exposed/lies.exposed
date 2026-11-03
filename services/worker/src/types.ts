import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type WorkerContext } from "#context/context.js";
import { type WorkerError } from "#io/worker.error.js";

// export type Reader<A> = (ctx: WorkerContext) => A;

/**
 * RTE is a ReaderTaskEither with a WorkerContext and WorkerError
 */
export type RTE<A, E = WorkerError> = ReaderTaskEither<WorkerContext, E, A>;
