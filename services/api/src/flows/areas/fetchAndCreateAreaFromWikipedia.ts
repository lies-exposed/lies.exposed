import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Area, type Media } from "@liexp/shared/lib/io/http/index.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { contentTypeFromFileExt } from "@liexp/shared/lib/utils/media.utils.js";
import { toInitialValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { fetchCoordinates } from "./fetchCoordinates.flow.js";
import { AreaEntity } from "#entities/Area.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import {
  fetchFromWikipedia,
  type WikiProviders,
} from "#flows/wikipedia/fetchFromWikipedia.js";
import { AreaIO } from "#routes/areas/Area.io.js";
import { MediaIO } from "#routes/media/media.io.js";
import { getWikiProvider } from "#services/entityFromWikipedia.service.js";

export const fetchAndCreateAreaFromWikipedia: TEFlow<
  [string, WikiProviders],
  { area: Area.Area; media: Media.Media[] }
> = (ctx) => (title, wp) => {
  return pipe(
    TE.Do,
    TE.bind("wpProvider", () => TE.right(getWikiProvider(ctx)(wp))),
    TE.bind("wikipedia", ({ wpProvider }) =>
      fetchFromWikipedia(wpProvider)(title),
    ),
    TE.map(({ wikipedia: { slug, featuredMedia, intro } }) => {
      ctx.logger.debug.log("Area fetched from wikipedia %s: %O", title, {
        featuredMedia,
      });

      return {
        area: {
          id: undefined as any,
          label: title,
          slug,
          excerpt: toInitialValue(intro),
          geometry: { type: "Point" as const, coordinates: [0, 0] },
          color: generateRandomColor(),
          media: [],
          body: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        media: featuredMedia
          ? {
              id: undefined as any,
              thumbnail: undefined,
              type: contentTypeFromFileExt(featuredMedia),
              location: featuredMedia,
              label: title,
              description: title,
              creator: undefined,
              events: [],
              links: [],
              keywords: [],
              featuredIn: [],
              deletedAt: undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          : undefined,
      };
    }),
    fp.TE.chain(({ area: areaData, media }) => {
      ctx.logger.debug.log(`Media %O`, media);
      return pipe(
        ctx.db.findOne(AreaEntity, {
          where: { label: areaData.label },
        }),
        fp.TE.chain((a) => {
          const saveAreaTask = (media: MediaEntity | null) =>
            fp.O.isSome(a)
              ? fp.TE.right(a.value)
              : pipe(
                  fetchCoordinates(ctx)(areaData.label),
                  TE.map((geo) => ({
                    ...areaData,
                    ...pipe(
                      geo,
                      fp.O.getOrElse(() => ({})),
                    ),
                  })),
                  TE.chain((areaData) =>
                    ctx.db.save(AreaEntity, [
                      {
                        ...areaData,
                        featuredImage: media,
                        media: [],
                      },
                    ]),
                  ),
                  TE.map((mm) => mm[0]),
                );

          const saveMediaTask = pipe(
            media,
            fp.O.fromNullable,
            fp.O.fold(
              () => fp.TE.right(null),
              (media) =>
                pipe(
                  ctx.db.save(MediaEntity, [
                    {
                      ...media,
                      areas: [],
                      location: media.location,
                      thumbnail: media.thumbnail ?? null,
                      creator: null,
                    },
                  ]),
                  fp.TE.map<MediaEntity[], MediaEntity | null>((mm) => mm[0]),
                ),
            ),
          );

          return pipe(
            TE.Do,
            TE.bind("media", () => saveMediaTask),
            TE.bind("area", ({ media }) => saveAreaTask(media)),
            fp.TE.chainEitherK(({ area }) =>
              sequenceS(fp.E.Applicative)({
                area: AreaIO.decodeSingle(area, ctx.env.SPACE_ENDPOINT),
                media: pipe(
                  MediaIO.decodeMany(
                    (area.media ?? []).map((m) => ({
                      ...m,
                      areas: m.areas.map((a): any => a.id),
                    })),
                    ctx.env.SPACE_ENDPOINT,
                  ),
                ),
              }),
            ),
          );
        }),
      );
    }),
  );
};
