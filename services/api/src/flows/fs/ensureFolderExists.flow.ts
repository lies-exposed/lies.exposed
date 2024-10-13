import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const ensureFolderExists =
  (filePath: string): TEReader<void> =>
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
      }, toControllerError),
      fp.TE.fromIOEither,
    );
  };
