import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { ENVParser } from "@liexp/shared/lib/utils/env.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type WorkerContext } from "./context.js";
import { makeContext } from "./make.js";
import { ENV } from "#io/env.js";
import { type WorkerError } from "#io/worker.error.js";

export const loadContext = (): TE.TaskEither<WorkerError, WorkerContext> => {
  return pipe(
    loadAndParseENV(ENVParser(ENV.decode))(process.cwd()),
    TE.fromEither,
    TE.chain(makeContext),
  );
};
