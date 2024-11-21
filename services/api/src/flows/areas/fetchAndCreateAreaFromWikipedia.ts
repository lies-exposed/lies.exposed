import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Area, type Media } from "@liexp/shared/lib/io/http/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { contentTypeFromFileExt } from "@liexp/shared/lib/utils/media.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { fetchCoordinates } from "./fetchCoordinates.flow.js";
import { type ServerContext } from "#context/context.type.js";
import { AreaEntity } from "#entities/Area.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import {
  fetchFromWikipedia,
  type WikiProviders,
} from "#flows/wikipedia/fetchFromWikipedia.js";
import {
  AreaRepository,
  MediaRepository,
} from "#providers/db/entity-repository.provider.js";
import { AreaIO } from "#routes/areas/Area.io.js";
import { MediaIO } from "#routes/media/media.io.js";
import { getWikiProvider } from "#services/entityFromWikipedia.service.js";

export const fetchAndCreateAreaFromWikipedia = (
  title: string,
  wp: WikiProviders,
): TEReader<{ area: Area.Area; media: Media.Media[] }> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("wpProvider", () => fp.RTE.fromReader(getWikiProvider(wp))),
    fp.RTE.bind("wikipedia", ({ wpProvider }) =>
      fp.RTE.fromTaskEither(fetchFromWikipedia(title)(wpProvider)),
    ),
    fp.RTE.map(({ wikipedia: { slug, featuredMedia, intro } }) => {
      // ctx.logger.debug.log("Area fetched from wikipedia %s: %O", title, {
      //   featuredMedia,
      // });

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
              featuredInStories: [],
              deletedAt: undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          : undefined,
      };
    }),
    fp.RTE.chain(({ area: areaData, media }) => {
      // ctx.logger.debug.log(`Media %O`, media);
      return pipe(
        fp.RTE.ask<ServerContext>(),
        fp.RTE.chainTaskEitherK((ctx) =>
          ctx.db.findOne(AreaEntity, {
            where: { label: areaData.label },
          }),
        ),
        fp.RTE.chain((a) => {
          const saveAreaTask = (
            media: MediaEntity | null,
          ): TEReader<AreaEntity> =>
            fp.O.isSome(a)
              ? fp.RTE.right(a.value)
              : pipe(
                  fetchCoordinates(areaData.label),
                  fp.RTE.map((geo) => ({
                    ...areaData,
                    ...pipe(
                      geo,
                      fp.O.getOrElse(() => ({})),
                    ),
                  })),
                  fp.RTE.chain((areaData) =>
                    AreaRepository.save([
                      {
                        ...areaData,
                        featuredImage: media,
                        media: [],
                      },
                    ]),
                  ),
                  fp.RTE.map((mm) => mm[0]),
                );

          const saveMediaTask = pipe(
            media,
            fp.O.fromNullable,
            fp.O.fold(
              () => fp.RTE.right(null),
              (media) =>
                pipe(
                  MediaRepository.save([
                    {
                      ...media,
                      areas: [],
                      location: media.location,
                      thumbnail: media.thumbnail ?? null,
                      creator: null,
                    },
                  ]),
                  fp.RTE.map<MediaEntity[], MediaEntity | null>((mm) => mm[0]),
                ),
            ),
          );

          return pipe(
            fp.RTE.Do,
            fp.RTE.bind("media", () => saveMediaTask),
            fp.RTE.bind("area", ({ media }) => saveAreaTask(media)),
            fp.RTE.chain(({ area }) =>
              pipe(
                fp.RTE.ask<ServerContext>(),
                fp.RTE.chainEitherK((ctx) =>
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
              ),
            ),
          );
        }),
      );
    }),
  );
};
