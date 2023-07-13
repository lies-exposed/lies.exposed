import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor";
import { type CreateGroupBody } from "@liexp/shared/lib/io/http/Group";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { type TEFlow } from "@flows/flow.types";
import { fetchFromWikipedia } from "@flows/wikipedia/fetchFromWikipedia";
import { NotFoundError, toControllerError } from "@io/ControllerError";

export const fetchGroupFromWikipedia: TEFlow<[string], CreateGroupBody> =
  (ctx) => (pageId) => {
    return pipe(
      fetchFromWikipedia(ctx)(pageId),
      TE.map(({ page, avatar, intro }) => {
        const group = {
          name: page.title,
          username: getUsernameFromDisplayName(page.title),
          kind: "Public" as const,
          startDate: new Date(),
          endDate: undefined,
          members: [],
          excerpt: createExcerptValue(intro),
          avatar: avatar as any,
          color: generateRandomColor(),
          body: {},
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
