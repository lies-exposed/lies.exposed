import { pipe } from "@liexp/core/lib/fp/index.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import { type CreateGroupBody } from "@liexp/shared/lib/io/http/Group.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { toInitialValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TEFlow } from "#flows/flow.types.js";
import { fetchFromWikipedia } from "#flows/wikipedia/fetchFromWikipedia.js";
import { NotFoundError, toControllerError } from "#io/ControllerError.js";

export const fetchGroupFromWikipedia: TEFlow<[string], CreateGroupBody> =
  (ctx) => (pageId) => {
    return pipe(
      TE.Do,
      TE.bind("wikipedia", () => fetchFromWikipedia(ctx)(pageId)),
      TE.bind("excerpt", ({ wikipedia }) =>
        pipe(
          toInitialValue(wikipedia.intro),
          TE.right,
          TE.mapLeft(toControllerError),
        ),
      ),
      TE.map(({ wikipedia: { page, featuredMedia: avatar }, excerpt }) => {
        const group = {
          name: page.title,
          username: getUsernameFromDisplayName(page.title),
          kind: "Public" as const,
          startDate: new Date(),
          endDate: undefined,
          members: [],
          excerpt: excerpt as any,
          avatar: avatar as any,
          color: generateRandomColor(),
          body: undefined,
        };

        return group;
      }),
    );
  };

export const searchGroupAndCreateFromWikipedia: TEFlow<
  [string],
  CreateGroupBody
> = (ctx) => (search) => {
  return pipe(
    ctx.wp.search(search),
    TE.mapLeft(toControllerError),
    TE.filterOrElse(
      (r) => r.results[0],
      () => NotFoundError(`Group ${search} on wikipedia`),
    ),
    TE.chain((p) => fetchGroupFromWikipedia(ctx)(p.results[0].pageid)),
  );
};
