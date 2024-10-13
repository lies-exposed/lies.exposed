import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CreateGroupBody } from "@liexp/shared/lib/io/http/Group.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { toInitialValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TEReader } from "#flows/flow.types.js";
import {
  fetchFromWikipedia,
  type WikiProviders,
} from "#flows/wikipedia/fetchFromWikipedia.js";
import { NotFoundError, toControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";
import { getWikiProvider } from "#services/entityFromWikipedia.service.js";

export const fetchGroupFromWikipedia =
  (title: string, wp: WikiProviders): TEReader<CreateGroupBody> =>
  (ctx) => {
    return pipe(
      TE.Do,
      TE.bind("wikipedia", () =>
        fetchFromWikipedia(title)(getWikiProvider(wp)(ctx)),
      ),
      TE.map(({ wikipedia: { featuredMedia: avatar, intro, slug } }) => {
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
    );
  };

export const searchGroupAndCreateFromWikipedia = (
  search: string,
  wp: WikiProviders,
): TEReader<CreateGroupBody> => {
  return pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.chainTaskEitherK((ctx) => ctx.wp.search(search)),
    fp.RTE.mapLeft(toControllerError),
    fp.RTE.filterOrElse(
      (r) => !!r[0],
      () => NotFoundError(`Group ${search} on wikipedia`),
    ),
    fp.RTE.chain((p) => fetchGroupFromWikipedia(p[0].title, wp)),
  );
};
