import debug from "debug";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

const baseLogger = debug("@liexp");

export interface FPTSLogger {
  log: (message: string, ...args: any[]) => void;
  logInPipe: (message: string) => <I>(value: I) => I;
  logInTask: (message: string) => <I>(t: T.Task<I>) => T.Task<I>;
  logInTaskEither: <A>(
    f: ((r: A) => [string, ...any[]]) | string,
  ) => <E>(t: TE.TaskEither<E, A>) => TE.TaskEither<E, A>;
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
  const info = logger.extend(name).extend("info");
  const warn = logger.extend(name).extend("warn");
  const error = logger.extend(name).extend("error");
  const test = logger.extend(name).extend("test");

  const logInPipe =
    (d: debug.Debugger) => (message: string) => (value: any) => {
      d(message, value);
      return value;
    };

  const logInTask =
    (d: debug.Debugger) => (message: string) => (t: T.Task<any>) =>
      pipe(
        t,
        T.map((result) => {
          d(message, result);
          return result;
        }),
      );

  const logInTaskEither =
    (d: debug.Debugger) =>
    (f: ((r: any) => [string, ...any[]]) | string) =>
    <E, A>(t: TE.TaskEither<E, A>) =>
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
