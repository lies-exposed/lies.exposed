import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { makeContext } from "./index.js";
import { type ServerContext } from "#context/context.type.js";
import { type ControllerError } from "#io/ControllerError.js";
import { parseENV } from "#utils/env.utils.js";

export const loadContext = (): TE.TaskEither<
  ControllerError,
  ServerContext
> => {
  return pipe(
    loadAndParseENV(parseENV)(process.cwd()),
    TE.fromEither,
    TE.chain(makeContext),
  );
};
