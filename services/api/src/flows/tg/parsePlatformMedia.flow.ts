import { pipe } from "@liexp/core/lib/fp/index.js";
import { type VideoPlatformMatch } from "@liexp/shared/lib/helpers/media.helper.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type * as puppeteer from "puppeteer-core";
import { MediaEntity } from "#entities/Media.entity.js";
import { type UserEntity } from "#entities/User.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { extractMediaExtra } from "#flows/media/extra/extractMediaExtra.flow.js";
import { extractMediaFromPlatform } from "#flows/media/extractMediaFromPlatform.flow.js";
import { MediaRepository } from "#providers/db/entity-repository.provider.js";

export const parsePlatformMedia =
  (
    url: URL,
    m: VideoPlatformMatch,
    page: puppeteer.Page,
    creator: UserEntity,
  ): TEReader<MediaEntity[]> =>
  (ctx) => {
    ctx.logger.debug.log("Parse platform media %O (%s)", m, url);
    return pipe(
      TE.Do,
      TE.bind("platformMedia", () => {
        return extractMediaFromPlatform(url, m, page)(ctx);
      }),
      TE.bind("media", ({ platformMedia }) => {
        if (platformMedia.location) {
          return pipe(
            ctx.db.findOne(MediaEntity, {
              where: { location: platformMedia.location },
            }),
            TE.chain((record) => {
              if (O.isSome(record)) {
                return TE.right([record.value]);
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
        return TE.right([]);
      }),
      TE.bind("extra", ({ media }) => {
        return extractMediaExtra(media[0])(ctx);
      }),
      TE.chain(({ media, extra }) => {
        return MediaRepository.save([{ ...media, extra }])(ctx);
      }),
    );
  };
