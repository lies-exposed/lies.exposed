import { fp } from "@liexp/core/lib/fp/index.js";
import { distanceFromNow } from "@liexp/shared/lib/utils/date.utils.js";
import { differenceInHours } from "date-fns";
import { pipe } from "fp-ts/lib/function.js";
import { type TEReader } from "../flow.types.js";

export const olderThan =
  (
    filePath: string,
    hours: number,
  ): TEReader<"older" | "valid" | "not-found"> =>
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
