import debug from "debug";

const baseLogger = debug("@liexp");

export interface FPTSLogger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: (message: string, ...args: any[]) => void;
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

const makeLogger = (log: debug.Debugger): FPTSLogger => ({
  log,
});

export const GetLogger = (name: string): Logger => {
  const logger = baseLogger.extend(name);
  const debug = logger.extend("debug");
  const info = logger.extend("info");
  const warn = logger.extend("warn");
  const error = logger.extend("error");
  const test = logger.extend("test");

  return {
    extend: GetLogger,
    debug: makeLogger(debug),
    info: makeLogger(info),
    warn: makeLogger(warn),
    error: makeLogger(error),
    test: makeLogger(test),
  };
};
