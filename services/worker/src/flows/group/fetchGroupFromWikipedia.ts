import { fetchFromWikipedia } from "@liexp/backend/lib/flows/wikipedia/fetchFromWikipedia.js";
import { type WikiProviders } from "@liexp/backend/lib/providers/wikipedia/types.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CreateGroupBody } from "@liexp/shared/lib/io/http/Group.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { type RTE } from "../../types.js";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError } from "#io/worker.error.js";
import { getWikiProvider } from "#services/entityFromWikipedia.service.js";

export const fetchGroupFromWikipedia =
  (title: string, wp: WikiProviders): RTE<CreateGroupBody> =>
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
                type: ImageType.types[0].value,
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

export const searchGroupAndCreateFromWikipedia = (
  search: string,
  wp: WikiProviders,
): RTE<CreateGroupBody> => {
  return pipe(
    fp.RTE.ask<WorkerContext>(),
    fp.RTE.chainTaskEitherK((ctx) => ctx.wp.search(search)),
    fp.RTE.mapLeft(toWorkerError),
    fp.RTE.filterOrElse(
      (r) => !!r[0],
      () => toWorkerError(`Group ${search} on wikipedia`),
    ),
    fp.RTE.chain((p) => fetchGroupFromWikipedia(p[0].title, wp)),
  );
};
