import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { fetchCoordinates } from "@liexp/backend/lib/flows/geo/fetchCoordinates.flow.js";
import {
  fetchFromWikipedia,
  type WikiProviders,
} from "@liexp/backend/lib/flows/wikipedia/fetchFromWikipedia.js";
import { type WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import {
  AreaRepository,
  MediaRepository,
} from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { contentTypeFromFileExt } from "@liexp/shared/lib/utils/media.utils.js";
import { type RTE } from "../../types.js";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError, type WorkerError } from "#io/worker.error.js";
import { getWikiProvider } from "#services/entityFromWikipedia.service.js";

export const fetchAndCreateAreaFromWikipedia = (
  title: string,
  wp: WikiProviders,
): RTE<{ area: AreaEntity; media: MediaEntity[] }> => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("wikipedia", () =>
      pipe(
        fp.RTE.asks<WorkerContext, WikipediaProvider, WorkerError>(
          getWikiProvider(wp),
        ),
        fp.RTE.chainTaskEitherK((wp) =>
          pipe(fetchFromWikipedia(title)(wp), fp.TE.mapLeft(toWorkerError)),
        ),
      ),
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
        fp.RTE.ask<WorkerContext>(),
        fp.RTE.chainTaskEitherK((ctx) =>
          ctx.db.findOne(AreaEntity, {
            where: { label: areaData.label },
          }),
        ),
        fp.RTE.chain((a) => {
          const saveAreaTask = (media: MediaEntity | null): RTE<AreaEntity> =>
            fp.O.isSome(a)
              ? fp.RTE.right(a.value)
              : pipe(
                  fetchCoordinates(areaData.label)<WorkerContext>,
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
              () => fp.RTE.right([]),
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
                ),
            ),
          );

          return pipe(
            fp.RTE.Do,
            fp.RTE.bind("media", () => saveMediaTask),
            fp.RTE.bind("area", ({ media }) => saveAreaTask(media[0])),
            fp.RTE.mapLeft(toWorkerError),
            // fp.RTE.chain(({ area }) =>
            //   pipe(
            //     fp.RTE.ask<WorkerContext>(),
            //     fp.RTE.chainEitherK((ctx) =>
            //       sequenceS(fp.E.Applicative)({
            //         area: AreaIO.decodeSingle(area, ctx.env.SPACE_ENDPOINT),
            //         media: pipe(
            //           MediaIO.decodeMany(
            //             (area.media ?? []).map((m) => ({
            //               ...m,
            //               areas: m.areas.map((a): any => a.id),
            //             })),
            //             ctx.env.SPACE_ENDPOINT,
            //           ),
            //         ),
            //       }),
            //     ),
            //   ),
            // ),
          );
        }),
      );
    }),
  );
};
