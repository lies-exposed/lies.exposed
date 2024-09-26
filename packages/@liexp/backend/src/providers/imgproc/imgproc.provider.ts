import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import type * as logger from "@liexp/core/lib/logger/index.js";
import type ExifReader from "exifreader";
import type { load } from "exifreader";
import * as TE from "fp-ts/lib/TaskEither.js";
import type sharp from "sharp";
import { IOError } from "ts-io-error";

export class ImgProcError extends IOError {
  name = "ImgProcError";
}

export const decodeExifTag = (
  tag:
    | ExifReader.XmpTag
    | ExifReader.TypedTag<any>
    | ExifReader.ValueTag
    | { description: string; value: number }
    | undefined,
): number | undefined => {
  if (tag?.value) {
    return tag.value;
  }

  return undefined;
};

export const toError =
  (l: logger.Logger) =>
  (e: unknown): ImgProcError => {
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
    file: string | File,
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
    run: (f) => TE.tryCatch(async () => f(client), toError(logger)),
    readExif: (file, opts) => {
      return pipe(
        fp.TE.tryCatch(
          () => exifR.load(file, { ...opts, async: true }),
          toError(logger),
        ),
      );
    },
  };
};
