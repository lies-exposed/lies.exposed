import debug from "debug";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";

const baseLogger = debug("@liexp");

export interface FPTSLogger {
  log: (message: string, ...args: any[]) => void;
  logInPipe: (message: string) => <I>(value: I) => I;
  logInTask: (message: string) => <I>(t: T.Task<I>) => T.Task<I>;
  logInTaskEither: (
    message: string
  ) => <E, A>(t: TE.TaskEither<E, A>) => TE.TaskEither<E, A>;
}

export interface Logger {
  debug: FPTSLogger;
  info: FPTSLogger;
  test: FPTSLogger;
  error: FPTSLogger;
  extend: GetLogger;
}

export type GetLogger = (name: string) => Logger;

export const GetLogger = (name: string): Logger => {
  const logger = baseLogger.extend(name);
  const debug = logger.extend("debug");
  const info = logger.extend(name).extend("info");
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
        })
      );

  const logInTaskEither =
    (d: debug.Debugger) =>
    (message: string) =>
    <E, A>(t: TE.TaskEither<E, A>) =>
      pipe(
        t,
        TE.mapLeft((e) => {
          d(message, e);
          return e;
        }),
        TE.map((result) => {
          d(message, result);
          return result;
        })
      );

  return {
    extend: GetLogger,
    debug: {
      log: debug,
      logInPipe: logInPipe(debug),
      logInTask: logInTask(debug),
      logInTaskEither: logInTaskEither(debug),
    },
    info: {
      log: info,
      logInPipe: logInPipe(info),
      logInTask: logInTask(info),
      logInTaskEither: logInTaskEither(info),
    },
    error: {
      log: error,
      logInPipe: logInPipe(error),
      logInTask: logInTask(error),
      logInTaskEither: logInTaskEither(error),
    },
    test: {
      log: test,
      logInPipe: logInPipe(test),
      logInTask: logInTask(test),
      logInTaskEither: logInTaskEither(test),
    },
  };
};
