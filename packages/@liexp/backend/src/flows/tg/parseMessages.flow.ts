import * as fs from "fs";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type FFMPEGProviderContext } from "../../context/ffmpeg.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import {
  type ImgProcClientContext,
  type TGBotProviderContext,
} from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { type QueuesProviderContext } from "../../context/queue.context.js";
import { type RedisContext } from "../../context/redis.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { type URLMetadataContext } from "../../context/urlMetadata.context.js";
import { toTGError, type TGError } from "../../providers/tg/tg.provider.js";
import { LoggerService } from "../../services/logger/logger.service.js";
import {
  createFromTGMessage,
  type EventResult,
} from "./createFromTGMessage.flow.js";

export const parseTGMessageFlow = <
  C extends TGBotProviderContext &
    LoggerContext &
    FSClientContext &
    DatabaseContext &
    PuppeteerProviderContext &
    HTTPProviderContext &
    ImgProcClientContext &
    SpaceContext &
    ENVContext &
    URLMetadataContext &
    QueuesProviderContext &
    ConfigContext &
    FFMPEGProviderContext &
    RedisContext,
>(
  filePath: string,
  deleteFile: boolean,
): ReaderTaskEither<C, TGError, EventResult> => {
  return pipe(
    fp.RTE.ask<C>(),
    LoggerService.RTE.debug(["Parsing file %s", filePath]),
    fp.RTE.chainIOEitherK(() =>
      fp.IOE.tryCatch(() => {
        return fs.readFileSync(filePath, "utf-8");
      }, toTGError),
    ),
    fp.RTE.chain((message) =>
      pipe(
        createFromTGMessage<C>(JSON.parse(message), {
          type: "text",
        }),
        fp.RTE.mapLeft(toTGError),
      ),
    ),
    fp.RTE.chainFirst((): ReaderTaskEither<C, TGError, void> => {
      if (deleteFile) {
        return pipe(
          fp.RTE.ask<C>(),
          LoggerService.RTE.debug(["Deleting file %s", filePath]),
          fp.RTE.chainIOEitherK((_r) =>
            fp.IOE.tryCatch(() => {
              fs.rmSync(filePath);
            }, toTGError),
          ),
        );
      }
      return fp.RTE.right(undefined);
    }),
  );
};
