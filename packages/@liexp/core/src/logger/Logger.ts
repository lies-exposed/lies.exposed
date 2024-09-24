import debug from "debug";
import * as T from "fp-ts/lib/Task.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";

const baseLogger = debug("@liexp");

export interface FPTSLogger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: (message: string, ...args: any[]) => void;
  logInPipe: (message: string) => <I>(value: I) => I;
  logInTask: (message: string) => <I>(t: T.Task<I>) => T.Task<I>;
  logInTaskEither: <E, A>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    f: ((r: any) => [string, ...any[]]) | string,
  ) => (t: TE.TaskEither<E, A>) => TE.TaskEither<E, A>;
}

export interface Logger {
  debug: FPTSLogger;
  info: FPTSLogger;
  test: FPTSLogger;
  error: FPTSLogger;
  warn: FPTSLogger;
  extend: GetLogger;
}

export type GetLogger = (name: string) => Logger;

export const GetLogger = (name: string): Logger => {
  const logger = baseLogger.extend(name);
  const debug = logger.extend("debug");
  const info = logger.extend("info");
  const warn = logger.extend("warn");
  const error = logger.extend("error");
  const test = logger.extend("test");

  const logInPipe =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (d: debug.Debugger) => (message: string) => (value: any) => {
      d(message, value);
      return value;
    };

  const logInTask =
    (d: debug.Debugger) =>
    (message: string) =>
    <T>(t: T.Task<T>) =>
      pipe(
        t,
        T.map((result) => {
          d(message, result);
          return result;
        }),
      );

  const logInTaskEither =
    (d: debug.Debugger) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <E, T>(f: ((r: any) => [string, ...any[]]) | string) =>
    (t: TE.TaskEither<E, T>) =>
      pipe(
        t,
        TE.mapLeft((e) => {
          const [msg, ...args] = typeof f === "string" ? [f, e] : f(e);
          d(msg, ...args);
          return e;
        }),
        TE.map((result) => {
          const [msg, ...args] =
            typeof f === "string" ? [f, result] : f(result);
          d(msg, ...args);
          return result;
        }),
      );

  const makeLogger = (log: debug.Debugger): FPTSLogger => ({
    log,
    logInPipe: logInPipe(log),
    logInTask: logInTask(log),
    logInTaskEither: logInTaskEither(log),
  });

  return {
    extend: GetLogger,
    debug: makeLogger(debug),
    info: makeLogger(info),
    warn: makeLogger(warn),
    error: makeLogger(error),
    test: makeLogger(test),
  };
};
