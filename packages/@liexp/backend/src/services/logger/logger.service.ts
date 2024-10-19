import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type FPTSLogger, type Logger } from "@liexp/core/lib/logger/Logger.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type LoggerContext } from "../../context/index.js";

type LogFn<A> = ((r: A) => [string, ...any[]]) | any[] | string;

const logA =
  <A>(f: LogFn<A>, a: A) =>
  (logger: FPTSLogger) => {
    const [msg, ...args] =
      typeof f === "function"
        ? f(a)
        : typeof f === "string"
          ? ([f, a] as string[])
          : f;

    logger.log(msg, ...args);
  };

const log = (fn: (logger: Logger) => FPTSLogger) => (f: LogFn<void>) => {
  return pipe(
    fp.R.asks<LoggerContext, void>((ctx) => {
      logA(f, undefined)(fn(ctx.logger));
    }),
  );
};

const teLogger =
  (fn: (logger: Logger) => FPTSLogger) =>
  (ctx: LoggerContext, f: LogFn<any>) =>
  <A, E>(t: TaskEither<E, A>) =>
    pipe(
      t,
      fp.TE.mapLeft((e) => {
        logA(f, e as any)(fn(ctx.logger));
        return e;
      }),
      fp.TE.map((result) => {
        logA(f, result)(fn(ctx.logger));
        return result;
      }),
    );

const rteLogger =
  (fn: (logger: Logger) => FPTSLogger) =>
  <R extends LoggerContext, A, E>(f: LogFn<A>) =>
  (rte: ReaderTaskEither<R, E, A>): ReaderTaskEither<R, E, A> => {
    return pipe(
      rte,
      fp.RTE.orElse((e) => {
        return pipe(
          fp.RTE.ask<R>(),
          fp.RTE.chainIOEitherK((ctx) => {
            logA(f, e as any)(fn(ctx.logger));
            return fp.IOE.left<E, A>(e);
          }),
        );
      }),
      fp.RTE.chain((result) => {
        return pipe(
          fp.RTE.asks<R, A, E>((ctx) => {
            logA(f, result)(fn(ctx.logger));
            return result;
          }),
        );
      }),
    );
  };

export const LoggerService = {
  info: log((l) => l.info),
  debug: log((l) => l.debug),
  warn: log((l) => l.warn),
  error: log((l) => l.error),
  TE: {
    debug: teLogger((l) => l.debug),
    info: teLogger((l) => l.info),
    warn: teLogger((l) => l.warn),
    error: teLogger((l) => l.error),
  },
  RTE: {
    debug: rteLogger((l) => l.debug),
    info: rteLogger((l) => l.info),
    warn: rteLogger((l) => l.warn),
    error: rteLogger((l) => l.error),
  },
};
