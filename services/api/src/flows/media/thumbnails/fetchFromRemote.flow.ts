import { pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const fetchFromRemote: TEFlow<[string], ArrayBuffer> =
  (ctx) => (location) => {
    return pipe(
      ctx.http.get<ArrayBuffer>(location, {
        responseType: "arraybuffer",
      }),
      TE.mapLeft(toControllerError),
    );
  };
