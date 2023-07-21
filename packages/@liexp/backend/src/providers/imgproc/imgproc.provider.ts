import * as logger from "@liexp/core/lib/logger";
import * as TE from "fp-ts/TaskEither";
import type sharp from "sharp";
import { IOError } from "ts-io-error";

const s3Logger = logger.GetLogger("space");

class ImgProcError extends IOError {}

export const toError = (e: unknown): ImgProcError => {
  // eslint-disable-next-line
  s3Logger.error.log("Space Error %O", e);
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
}

export interface MakeImgProcClientConfig {
  client: ImgProcClientImpl;
}

export const MakeImgProcClient = ({
  client,
}: MakeImgProcClientConfig): ImgProcClient => {
  return {
    run(f) {
      return TE.tryCatch(async () => await f(client), toError);
    },
  };
};
