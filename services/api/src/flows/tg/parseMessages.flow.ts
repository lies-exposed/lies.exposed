import * as fs from "fs";
import { fp } from "@liexp/core/lib/fp";
import { pipe } from "fp-ts/lib/function";
import {
  type EventResult,
  createFromTGMessage,
} from "@flows/event-suggestion/createFromTGMessage.flow";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";

export const parseTGMessageFlow: TEFlow<[string, boolean], EventResult> =
  (ctx) => (filePath, deleteFile) => {
    return pipe(
      fp.TE.fromIOEither(
        fp.IOE.tryCatch(
          () => fs.readFileSync(filePath, "utf-8"),
          toControllerError
        )
      ),
      fp.TE.chain((message) =>
        createFromTGMessage(ctx)(JSON.parse(message), {
          type: "text",
        })
      ),
      fp.TE.chainFirst(() => {
        if (deleteFile) {
          return fp.TE.fromIOEither(
            fp.IOE.tryCatch(() => {
              ctx.logger.debug.log("Deleting file %s...", filePath);
              fs.rmSync(filePath);
            }, toControllerError)
          );
        }
        return fp.TE.right(undefined);
      })
    );
  };
