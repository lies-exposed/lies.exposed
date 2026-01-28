import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { fp, pipe } from "@liexp/core";
import { type TEReader } from "#flows/flow.types.js";

export const ensureConfigFoldersExist: TEReader<void> = (ctx) => {
  return pipe(
    [
      ...Object.values(ctx.config.dirs.config),
      ...Object.values(ctx.config.dirs.temp),
    ],
    fp.A.traverse(fp.IOE.ApplicativePar)((folder) =>
      fp.IOE.tryCatch(() => {
        ctx.fs._fs.mkdirSync(folder, { recursive: true });
      }, ServerError.fromUnknown),
    ),
    fp.TE.fromIOEither,
    fp.TE.map(() => undefined),
  );
};
