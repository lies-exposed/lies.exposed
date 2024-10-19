import path from "path";
import { getOlderThanOr } from "@liexp/backend/lib/flows/fs/getOlderThanOr.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ServerContext } from "#context/context.type.js";
import { type TEReader } from "#flows/flow.types.js";

export const getTempMediaCountFlow = (): TEReader<
  { filePath: string; fileRelativePath: string; fileSize: number }[]
> => {
  return pipe(
    fp.RTE.ask<ServerContext>(),
    fp.RTE.chainIOK(
      (ctx) => () =>
        path.resolve(ctx.config.dirs.temp.media, "temp-files.json"),
    ),
    fp.RTE.chain((fileName) =>
      pipe(readMediaTempFilesFlow(), getOlderThanOr(fileName, 1 * 24)),
    ),
  );
};

const readMediaTempFilesFlow = (): TEReader<
  { filePath: string; fileRelativePath: string; fileSize: number }[]
> => {
  return pipe(
    fp.RTE.ask<ServerContext>(),
    fp.RTE.chainIOK((ctx) => () => {
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
};
