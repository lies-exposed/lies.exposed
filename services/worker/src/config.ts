import { mkdirSync } from "fs";
import path from "path";
import { type BEConfig } from "@liexp/backend/lib/context/config.context.js";
import { type FSClientContext } from "@liexp/backend/lib/context/fs.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { ensureFolderExists } from "@liexp/backend/lib/flows/fs/ensureFolderExists.flow.js";
import { EventsConfig } from "@liexp/backend/lib/queries/config/index.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type WorkerError } from "./io/worker.error.js";

export type WorkerConfig = BEConfig;

export const Config =
  <C extends FSClientContext & LoggerContext>(
    cwd: string,
  ): ReaderTaskEither<C, WorkerError, WorkerConfig> =>
  (ctx) => {
    const tempRoot = path.resolve(cwd, "temp");

    const configFolders = {
      nlp: path.resolve(cwd, "config", "nlp"),
    };

    const tempFolders = {
      root: tempRoot,
      media: path.resolve(tempRoot, "media"),
      nlp: path.resolve(tempRoot, "nlp"),
      queue: path.resolve(tempRoot, "queue"),
      stats: path.resolve(tempRoot, "stats"),
      tg: path.resolve(tempRoot, "tg"),
    };

    [...Object.values(configFolders), ...Object.values(tempFolders)].forEach(
      (folder) => {
        mkdirSync(folder, { recursive: true });
      },
    );

    return pipe(
      [...Object.values(configFolders), ...Object.values(tempFolders)],
      fp.A.traverse(fp.TE.ApplicativePar)((filePath) =>
        ensureFolderExists(filePath)(ctx),
      ),
      fp.TE.map(() => ({
        media: {
          thumbnailWidth: 300,
          thumbnailHeight: 200,
        },
        dirs: {
          cwd,
          config: configFolders,
          temp: tempFolders,
        },
        events: EventsConfig,
      })),
    );
  };
