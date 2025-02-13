import { loadAndParseENV } from "@liexp/core/lib/env/utils.js";
import { ENVParser } from "@liexp/shared/lib/utils/env.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { ENV } from "../io/ENV.js";
import { type TEControllerError } from "../types/TEControllerError.js";
import { makeContext } from "./index.js";
import { type ServerContext } from "#context/context.type.js";

export const loadContext = (
  namespace: string,
): TEControllerError<ServerContext> => {
  return pipe(
    loadAndParseENV(ENVParser(ENV.decode))(process.cwd()),
    TE.fromEither,
    TE.chain(makeContext(namespace)),
  );
};
