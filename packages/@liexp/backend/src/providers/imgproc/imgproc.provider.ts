import { fp, pipe } from "@liexp/core/lib/fp";
import type * as logger from "@liexp/core/lib/logger";
import type ExifReader from "exifreader";
import type { load } from "exifreader";
import * as TE from "fp-ts/TaskEither";
import type sharp from "sharp";
import { IOError } from "ts-io-error";

class ImgProcError extends IOError {}

export const toError =
  (l: logger.Logger) =>
  (e: unknown): ImgProcError => {
    // eslint-disable-next-line
    l.error.log("Space Error %O", e);
    if (e instanceof Error) {
      return {
        name: "ImgProcError",
        status: 500,
        message: e.message,
        details: {
          kind: "ServerError",
          status: "500",
          meta: e.stack,
        },
      };
    }
    return {
      name: "ImgProcError",
      status: 500,
      message: "Internal Error",
      details: {
        kind: "ServerError",
        status: "500",
      },
    };
  };

export type ImgProcClientImpl = typeof sharp;

export interface ImgProcClient {
  run: (
    f: (s: ImgProcClientImpl) => Promise<Buffer>,
  ) => TE.TaskEither<ImgProcError, Buffer>;
  readExif: (
    file: Buffer,
    options: Parameters<typeof load>[1],
  ) => TE.TaskEither<ImgProcError, ExifReader.Tags>;
}

export interface MakeImgProcClientConfig {
  logger: logger.Logger;
  client: ImgProcClientImpl;
  exifR: { load: typeof load };
}

export const MakeImgProcClient = ({
  logger,
  client,
  exifR,
}: MakeImgProcClientConfig): ImgProcClient => {
  return {
    run: (f) => TE.tryCatch(async () => await f(client), toError(logger)),
    readExif: (file, opts) => {
      return pipe(
        fp.IOE.tryCatch(() => exifR.load(file, opts), toError(logger)),
        TE.fromIOEither,
      );
    },
  };
};
