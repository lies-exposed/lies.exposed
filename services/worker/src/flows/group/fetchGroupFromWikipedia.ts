import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { fetchFromWikipedia } from "@liexp/backend/lib/flows/wikipedia/fetchFromWikipedia.js";
import { type WikiProviders } from "@liexp/backend/lib/providers/wikipedia/types.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type AddGroupBody } from "@liexp/shared/lib/io/http/Group.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { Schema } from "effect";
import { Equal } from "typeorm";
import { type RTE } from "../../types.js";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError } from "#io/worker.error.js";
import { getWikiProvider } from "#services/entityFromWikipedia.service.js";

export const fetchGroupFromWikipedia =
  (title: string, wp: WikiProviders): RTE<AddGroupBody> =>
  (ctx) => {
    return pipe(
      fp.TE.Do,
      fp.TE.bind("wikipedia", () =>
        pipe(
          fetchFromWikipedia(title)(getWikiProvider(wp)(ctx)),
          fp.TE.mapLeft(toWorkerError),
        ),
      ),
      fp.TE.map(({ wikipedia: { featuredMedia: avatar, intro, slug } }) => {
        const group = {
          name: title,
          username: slug,
          kind: "Public" as const,
          startDate: new Date(),
          endDate: undefined,
          members: [],
          excerpt: toInitialValue(intro),
          avatar: avatar
            ? {
                id: uuid(),
                label: title,
                description: intro,
                location: avatar,
                thumbnail: undefined,
                type: ImageType.members[0].literals[0],
                extra: undefined,
                events: [],
                links: [],
                keywords: [],
                areas: [],
              }
            : undefined,
          color: generateRandomColor(),
          body: undefined,
        };

        return group;
      }),
      fp.TE.mapLeft(toWorkerError),
    );
  };

export const fetchAndCreateGroupFromWikipedia =
  (title: string, wp: WikiProviders): RTE<GroupEntity> =>
  (ctx) =>
    pipe(
      fetchGroupFromWikipedia(title, wp)(ctx),
      fp.TE.chain((group) =>
        pipe(
          ctx.db.findOne(GroupEntity, {
            where: {
              username: Equal(group.username),
            },
          }),
          LoggerService.TE.debug(ctx, [`Group %O`]),
          fp.TE.chain((a) => {
            if (fp.O.isSome(a)) {
              return fp.TE.right([a.value]);
            }
            return ctx.db.save(GroupEntity, [
              {
                id: uuid(),
                ...group,
                members: [],
                avatar: Schema.is(UUID)(group.avatar)
                  ? { id: group.avatar }
                  : group.avatar !== null
                    ? {
                        ...group.avatar,
                        events: [],
                        links: [],
                        areas: [],
                        keywords: [],
                      }
                    : null,
              },
            ]);
          }),
          fp.TE.map((r) => r[0]),
        ),
      ),
    );

export const searchGroupAndCreateFromWikipedia = (
  search: string,
  wp: WikiProviders,
): RTE<GroupEntity> => {
  return pipe(
    fp.RTE.ask<WorkerContext>(),
    fp.RTE.chainTaskEitherK((ctx) => ctx.wp.search(search)),
    fp.RTE.mapLeft(toWorkerError),
    fp.RTE.filterOrElse(
      (r) => !!r[0],
      () => toWorkerError(`Group ${search} on wikipedia`),
    ),
    fp.RTE.chain((p) => fetchAndCreateGroupFromWikipedia(p[0].title, wp)),
  );
};
