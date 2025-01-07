import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type VideoPlatformMatch } from "@liexp/shared/lib/helpers/media.helper.js";
import { type UUID, type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import * as O from "fp-ts/lib/Option.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import type * as puppeteer from "puppeteer-core";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type HTTPProviderContext } from "../../context/http.context.js";
import {
  type ImgProcClientContext,
  type FFMPEGProviderContext,
} from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { MediaEntity } from "../../entities/Media.entity.js";
import { type UserEntity } from "../../entities/User.entity.js";
import { type ServerError } from "../../errors/ServerError.js";
import { type DBError } from "../../providers/orm/database.provider.js";
import { MediaRepository } from "../../services/entity-repository.service.js";
import { extractMediaExtra } from "../media/extra/extractMediaExtra.flow.js";
import { extractMediaFromPlatform } from "../media/extractMediaFromPlatform.flow.js";

export const parsePlatformMedia =
  <
    C extends LoggerContext &
      DatabaseContext &
      FFMPEGProviderContext &
      ConfigContext &
      HTTPProviderContext &
      ImgProcClientContext &
      SpaceContext &
      ENVContext &
      FSClientContext,
  >(
    url: URL,
    m: VideoPlatformMatch,
    page: puppeteer.Page,
    creator: UserEntity,
  ): ReaderTaskEither<C, ServerError | DBError, UUID[]> =>
  (ctx) => {
    ctx.logger.debug.log("Parse platform media %O (%s)", m, url);
    return pipe(
      fp.TE.Do,
      fp.TE.bind("platformMedia", () => {
        return extractMediaFromPlatform(url, m, page)(ctx);
      }),
      fp.TE.bind("media", ({ platformMedia }) => {
        if (platformMedia.location) {
          return pipe(
            ctx.db.findOne(MediaEntity, {
              where: { location: platformMedia.location },
            }),
            fp.TE.chain((record) => {
              if (O.isSome(record)) {
                return fp.TE.right([record.value]);
              }

              return ctx.db.save(MediaEntity, [
                {
                  ...platformMedia,
                  description:
                    platformMedia.description ?? platformMedia.location,
                  creator: { id: creator.id },
                },
              ]);
            }),
          );
        }
        return fp.TE.right([]);
      }),
      fp.TE.chain(
        ({ media: [media] }): TaskEither<ServerError, MediaEntity> =>
          pipe(
            extractMediaExtra(media)(ctx),
            fp.TE.map((extra) => ({
              ...media,
              extra: extra ? { ...media.extra, ...extra } : null,
            })),
          ),
      ),
      fp.TE.chain((media): TaskEither<DBError, MediaEntity[]> => {
        return MediaRepository.save([{ ...media }])(ctx);
      }),
      fp.TE.map((m) => m.map(({ id }) => id)),
    );
  };
