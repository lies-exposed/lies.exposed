import { fp } from "@liexp/core/lib/fp/index.js";
import { distanceFromNow } from "@liexp/shared/lib/utils/date.utils.js";
import { differenceInHours } from "date-fns";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type FSError } from "../../providers/fs/fs.provider.js";

export const olderThan =
  <C extends FSClientContext & LoggerContext>(
    filePath: string,
    hours: number,
  ): ReaderTaskEither<C, FSError, "older" | "valid" | "not-found"> =>
  (ctx) => {
    return pipe(
      ctx.fs.objectExists(filePath),
      fp.TE.map((statsExists) => {
        if (statsExists) {
          const { mtime } = ctx.fs._fs.statSync(filePath);
          const hoursDelta = differenceInHours(new Date(), mtime);

          ctx.logger.debug.log(
            "Last file update %s (%d h > %d h)",
            distanceFromNow(mtime),
            hoursDelta,
            hours,
          );

          return hoursDelta >= hours ? "older" : "valid";
        }

        return "not-found";
      }),
    );
  };
