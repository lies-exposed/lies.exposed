import { loadENV } from "@liexp/core/lib/env/utils.js";
import D from "debug";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { makeContext } from "./index.js";
import { type ControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";
import { parseENV } from "#utils/env.utils.js";

export const loadContext = (): TE.TaskEither<ControllerError, RouteContext> => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? "development";

  if (process.env.NODE_ENV === "development") {
    loadENV(process.cwd(), ".env.local");
    loadENV(process.cwd(), ".env");

    D.enable(process.env.DEBUG ?? "*");
  }

  return pipe(
    parseENV(process.env),
    TE.fromEither,
    TE.chain(makeContext),
    // TE.mapLeft(ControllerError.report),
  );
};
