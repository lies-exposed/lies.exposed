import path from "path";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/TaskEither";
import { type TEFlow } from "#flows/flow.types.js";

export const getTempMediaCountFlow: TEFlow<[], any[]> = (ctx) => () => {
  const mediaTempFilesCachePath = path.resolve(
    ctx.config.dirs.temp.stats,
    `media/temp-files.json`,
  );

  const readMediaTempFilesTask = pipe(
    TE.fromIO(() => {
      const media = ctx.fs._fs
        .readdirSync(ctx.config.dirs.temp.media)
        .map((file) => {
          const filePath = path.resolve(ctx.config.dirs.temp.media, file);
          const fileRelativePath = path.relative(ctx.config.dirs.cwd, filePath);
          const fileSize = ctx.fs._fs.statSync(filePath);

          return { filePath, fileRelativePath, fileSize: fileSize.size };
        });

      return media;
    }),
  );

  return ctx.fs.getOlderThanOr(
    mediaTempFilesCachePath,
    1 * 24, // one day
  )(readMediaTempFilesTask);
};
