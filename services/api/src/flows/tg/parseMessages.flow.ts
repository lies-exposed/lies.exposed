import * as fs from "fs";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  type EventResult,
  createFromTGMessage,
} from "./createFromTGMessage.flow.js";
import { type TEReader } from "#flows/flow.types.js";
import { LoggerService } from "#flows/logger/logger.service.js";
import { toControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

export const parseTGMessageFlow = (
  filePath: string,
  deleteFile: boolean,
): TEReader<EventResult> => {
  return pipe(
    fp.RTE.ask<RouteContext>(),
    LoggerService.RTE.debug(["Parsing file %s", filePath]),
    fp.RTE.chainIOEitherK(() =>
      fp.IOE.tryCatch(() => {
        return fs.readFileSync(filePath, "utf-8");
      }, toControllerError),
    ),
    fp.RTE.chain((message) =>
      createFromTGMessage(JSON.parse(message), {
        type: "text",
      }),
    ),
    fp.RTE.chainFirst(() => {
      if (deleteFile) {
        return pipe(
          fp.RTE.ask<RouteContext>(),
          LoggerService.RTE.debug(["Deleting file %s", filePath]),
          fp.RTE.chainIOEitherK((r) =>
            fp.IOE.tryCatch(() => {
              fs.rmSync(filePath);
            }, toControllerError),
          ),
        );
      }
      return fp.RTE.right(undefined);
    }),
  );
};
