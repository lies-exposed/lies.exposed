import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type FSClientContext } from "context/fs.context.js";
import { type LoggerContext } from "context/logger.context.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type FSError } from "providers/fs/fs.provider.js";
import { getOlderThanOr } from "../../fs/getOlderThanOr.flow.js";

export const getTempMediaCountFlow = <
  C extends FSClientContext & {
    config: Record<string, any>;
  } & LoggerContext,
>(): ReaderTaskEither<
  C,
  FSError,
  { filePath: string; fileRelativePath: string; fileSize: number }[]
> => {
  return pipe(
    fp.RTE.asks<C, string, FSError>((ctx) =>
      path.resolve(ctx.config.dirs.temp.media, "temp-files.json"),
    ),
    fp.RTE.chain((fileName) =>
      getOlderThanOr(fileName, 1 * 24)(readMediaTempFilesFlow()),
    ),
  );
};

const readMediaTempFilesFlow = <
  C extends FSClientContext & {
    config: Record<string, any>;
  } & LoggerContext,
>(): ReaderTaskEither<
  C,
  FSError,
  { filePath: string; fileRelativePath: string; fileSize: number }[]
> => {
  return pipe(
    fp.RTE.ask<C>(),
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
