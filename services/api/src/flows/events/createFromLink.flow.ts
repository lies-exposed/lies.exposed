import { pipe } from "@liexp/core/lib/fp/index.js";
import { toInitialValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type KeywordEntity } from "#entities/Keyword.entity.js";
import { type LinkEntity } from "#entities/Link.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const createEventFromLink: TEFlow<
  [LinkEntity, KeywordEntity[]],
  EventV2Entity
> = (ctx) => (l, hashtags) => {
  const publishDate = l.publishDate ?? new Date();
  return pipe(
    toInitialValue(l.description),
    TE.right,
    TE.mapLeft(toControllerError),
    TE.chain((excerpt) =>
      ctx.db.save(EventV2Entity, [
        {
          type: "Uncategorized" as const,
          excerpt: excerpt as any,
          payload: {
            title: l.title,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          date: publishDate,
          links: [l],
          media: [],
          keywords: hashtags,
        },
      ]),
    ),
    TE.map((ll) => ll[0]),
  );
};
