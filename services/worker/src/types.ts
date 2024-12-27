import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type WorkerContext } from "#context/context.js";
import { type WorkerError } from "#io/worker.error.js";

export type Reader<A> = (ctx: WorkerContext) => A;

/**
 * TEReaderC is a ReaderTaskEither with a ClientContext and ControllerError
 */
export type RTE<A, E = WorkerError> = ReaderTaskEither<WorkerContext, E, A>;

export type TE<A> = TaskEither<WorkerError, A>;
