import { pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateGroupBody } from "@liexp/shared/lib/io/http/Group.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { toInitialValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TEFlow } from "#flows/flow.types.js";
import {
  fetchFromWikipedia,
  type WikiProviders,
} from "#flows/wikipedia/fetchFromWikipedia.js";
import { NotFoundError, toControllerError } from "#io/ControllerError.js";

export const fetchGroupFromWikipedia: TEFlow<
  [string, WikiProviders],
  CreateGroupBody
> = (ctx) => (title, wp) => {
  return pipe(
    TE.Do,
    TE.bind("wikipedia", () =>
      fetchFromWikipedia(wp === "wikipedia" ? ctx.wp : ctx.rw)(title),
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
        avatar: avatar as any,
        color: generateRandomColor(),
        body: undefined,
      };

      return group;
    }),
  );
};

export const searchGroupAndCreateFromWikipedia: TEFlow<
  [string, WikiProviders],
  CreateGroupBody
> = (ctx) => (search, wp) => {
  return pipe(
    ctx.wp.search(search),
    TE.mapLeft(toControllerError),
    TE.filterOrElse(
      (r) => !!r[0],
      () => NotFoundError(`Group ${search} on wikipedia`),
    ),
    TE.chain((p) => fetchGroupFromWikipedia(ctx)(p[0].title, wp)),
  );
};
