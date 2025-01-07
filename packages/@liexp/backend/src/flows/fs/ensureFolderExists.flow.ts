import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { toFSError, type FSError } from "../../providers/fs/fs.provider.js";

export const ensureFolderExists =
  <C extends FSClientContext & LoggerContext>(
    filePath: string,
  ): ReaderTaskEither<C, FSError, void> =>
  (ctx) => {
    return pipe(
      fp.IOE.tryCatch(() => {
        const filePathDir = path.dirname(filePath);
        const tempFolderExists = ctx.fs._fs.existsSync(filePathDir);
        if (!tempFolderExists) {
          ctx.logger.debug.log(
            "Folder %s does not exist, creating...",
            filePathDir,
          );
          ctx.fs._fs.mkdirSync(filePathDir, { recursive: true });
        }
      }, toFSError),
      fp.TE.fromIOEither,
    );
  };
