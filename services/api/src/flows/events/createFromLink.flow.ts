import { pipe } from "@liexp/core/lib/fp/index.js";
import { toBNDocumentTE } from "@liexp/ui/lib/components/Common/BlockNote/utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type KeywordEntity } from "#entities/Keyword.entity.js";
import { type LinkEntity } from "#entities/Link.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError";

export const createEventFromLink: TEFlow<
  [LinkEntity, KeywordEntity[]],
  EventV2Entity
> = (ctx) => (l, hashtags) => {

  const publishDate = l.publishDate ?? new Date();
  return pipe(
    toBNDocumentTE(l.description),
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
