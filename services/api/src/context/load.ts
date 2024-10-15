import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { makeContext } from "./index.js";
import { type ControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";
import { parseENV } from "#utils/env.utils.js";

export const loadContext = (): TE.TaskEither<ControllerError, RouteContext> => {
  return pipe(
    loadAndParseENV(parseENV)(process.cwd()),
    TE.fromEither,
    TE.chain(makeContext),
  );
};
