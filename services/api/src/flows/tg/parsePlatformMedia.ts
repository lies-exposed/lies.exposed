import { pipe } from "@liexp/core/lib/fp/index.js";
import { type VideoPlatformMatch } from "@liexp/shared/lib/helpers/media.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type * as puppeteer from "puppeteer-core";
import { MediaEntity } from "#entities/Media.entity.js";
import { type UserEntity } from "#entities/User.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { extractMediaFromPlatform } from "#flows/media/extractMediaFromPlatform.flow.js";

export const parsePlatformMedia: TEFlow<
  [URL, VideoPlatformMatch, puppeteer.Page, UserEntity],
  MediaEntity[]
> = (ctx) => (url, m, page, creator) => {
  ctx.logger.debug.log("Parse platform media %O (%s)", m, url);
  return pipe(
    extractMediaFromPlatform(ctx)(url, m, page),
    TE.chain((media) => {
      return pipe(
        media.location,
        O.fromNullable,
        O.map((location) =>
          ctx.db.findOne(MediaEntity, { where: { location } }),
        ),
        O.fold(
          () => {
            return ctx.db.save(MediaEntity, [
              { ...media, creator: { id: creator.id } },
            ]);
          },
          (te) => {
            return pipe(
              te,
              TE.chain((record) => {
                if (O.isSome(record)) {
                  return TE.right([record.value]);
                }

                return ctx.db.save(MediaEntity, [
                  {
                    ...media,
                    description: media.description ?? media.location,
                    creator: { id: creator.id },
                  },
                ]);
              }),
            );
          },
        ),
      );
    }),
  );
};
