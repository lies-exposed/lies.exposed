import { pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type ConfigContext } from "../../../context/config.context.js";
import { type DatabaseContext } from "../../../context/db.context.js";
import { type ENVContext } from "../../../context/env.context.js";
import { type FFMPEGProviderContext } from "../../../context/ffmpeg.context.js";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { type ImgProcClientContext } from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type PDFProviderContext } from "../../../context/pdf.context.js";
import { type PuppeteerProviderContext } from "../../../context/puppeteer.context.js";
import { type SpaceContext } from "../../../context/space.context.js";
import { MediaEntity } from "../../../entities/Media.entity.js";
import { ServerError } from "../../../errors/ServerError.js";
import { createThumbnail } from "./createThumbnail.flow.js";

export const generateThumbnailFlow =
  <
    C extends DatabaseContext &
      SpaceContext &
      ENVContext &
      LoggerContext &
      ConfigContext &
      FSClientContext &
      HTTPProviderContext &
      PDFProviderContext &
      FFMPEGProviderContext &
      PuppeteerProviderContext &
      ImgProcClientContext,
  >({
    id,
  }: {
    id: UUID;
  }): ReaderTaskEither<C, ServerError, MediaEntity> =>
  (ctx) => {
    return pipe(
      TE.Do,
      TE.bind("media", () =>
        pipe(
          ctx.db.findOneOrFail(MediaEntity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["creator"],
            },
          }),
          TE.mapLeft(ServerError.fromUnknown),
        ),
      ),
      TE.bind("thumbnails", ({ media }) => {
        return createThumbnail({
          ...media,
          id,
        })(ctx);
      }),
      TE.chain(({ thumbnails, media }) =>
        pipe(
          ctx.db.save(MediaEntity, [
            {
              ...media,
              id,
              extra: {
                ...media.extra,
                thumbnails,
                needRegenerateThumbnail: false,
              },
            },
          ]),
          TE.mapLeft(ServerError.fromUnknown),
        ),
      ),
      TE.map((media) => media[0]),
    );
  };
