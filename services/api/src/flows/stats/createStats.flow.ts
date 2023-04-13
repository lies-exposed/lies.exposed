import fs from "fs";
import path from "path";
import * as IOE from "fp-ts/IOEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { createStatsByType } from "./createStatsByType.flow";
import { toControllerError, type ControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";

export const createStats =
  (ctx: RouteContext) =>
  (
    type: "keywords" | "groups" | "actors",
    id: string
  ): TE.TaskEither<ControllerError, any> => {
    const filePath = path.resolve(
      process.cwd(),
      `temp/stats/${type}/${id}.json`
    );

    ctx.logger.debug.log("%s stats file %s", filePath);

    return pipe(
      TE.fromIOEither(
        IOE.tryCatch(() => {
          const filePathDir = path.dirname(filePath);
          const tempFolderExists = fs.existsSync(filePathDir);
          if (!tempFolderExists) {
            ctx.logger.debug.log(
              "Folder %s does not exist, creating...",
              filePathDir
            );
            fs.mkdirSync(filePathDir, { recursive: true });
          }
        }, toControllerError)
      ),
      TE.chain(() => {
        return createStatsByType(ctx)(id, type);
      }),
      TE.chainIOEitherK(({ stats }) => {
        return IOE.tryCatch(() => {
          fs.writeFileSync(filePath, JSON.stringify(stats));
          return stats;
        }, toControllerError);
      })
    );
  };
