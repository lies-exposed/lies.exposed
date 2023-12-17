import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import { type Area, type Media } from "@liexp/shared/lib/io/http/index.js";
import { createExcerptValue } from "@liexp/shared/lib/slate/index.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { contentTypeFromFileExt } from "@liexp/shared/lib/utils/media.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AreaEntity } from "#entities/Area.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { fetchFromWikipedia } from "#flows/wikipedia/fetchFromWikipedia.js";
import { toAreaIO } from "#routes/areas/Area.io.js";
import { toMediaIO } from "#routes/media/media.io.js";

export const fetchAndCreateAreaFromWikipedia: TEFlow<
  [string],
  { area: Area.Area; media: Media.Media[] }
> = (ctx) => (pageId) => {
  return pipe(
    fetchFromWikipedia(ctx)(pageId),
    TE.map(({ page, featuredMedia, intro }) => {
      ctx.logger.debug.log("Area fetched from wikipedia %s: %O", page.title, {
        featuredMedia,
        intro,
      });
      const slug = pipe(
        page.fullurl.split("/"),
        fp.A.last,
        fp.O.map(getUsernameFromDisplayName),
        fp.O.getOrElse(() => getUsernameFromDisplayName(pageId)),
      );

      const excerpt = createExcerptValue(intro);
      return {
        area: {
          id: undefined as any,
          label: page.title,
          slug,
          excerpt,
          geometry: { type: "Point" as const, coordinates: [0, 0] },
          color: generateRandomColor(),
          media: [],
          body: excerpt,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        media: featuredMedia
          ? {
              id: undefined as any,
              thumbnail: undefined,
              type: contentTypeFromFileExt(featuredMedia),
              location: featuredMedia,
              label: page.title,
              description: page.title,
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
          const saveArea = fp.O.isSome(a)
            ? fp.TE.right([a.value])
            : pipe(
                ctx.geo.search(areaData.label),
                TE.map((geo) => ({
                  ...areaData,
                  geometry: {
                    type: "Point" as const,
                    coordinates: [+geo[0].lon, +geo[0].lat],
                  },
                })),
                TE.chain((areaData) =>
                  ctx.db.save(AreaEntity, [
                    {
                      ...areaData,
                      media: [],
                    },
                  ]),
                ),
              );

          return pipe(
            saveArea,
            ctx.logger.debug.logInTaskEither(`Saved area %O`),
            fp.TE.chain(([area]) =>
              pipe(
                media,
                fp.O.fromNullable,
                fp.O.fold(
                  () => fp.TE.right([]),
                  (media) =>
                    ctx.db.save(MediaEntity, [
                      {
                        ...media,
                        areas: [{ id: area.id }],
                        location: media.location,
                        thumbnail: media.thumbnail ?? null,
                        creator: null,
                      },
                    ]),
                ),
                fp.TE.chainEitherK((media) =>
                  sequenceS(fp.E.Applicative)({
                    area: toAreaIO(area),
                    media: pipe(
                      media.map((m) =>
                        toMediaIO(
                          { ...m, areas: m.areas.map((a): any => a.id) },
                          ctx.env.SPACE_ENDPOINT,
                        ),
                      ),
                      fp.A.sequence(fp.E.Applicative),
                    ),
                  }),
                ),
              ),
            ),
          );
        }),
      );
    }),
  );
};
