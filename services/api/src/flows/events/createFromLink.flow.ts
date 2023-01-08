import { createExcerptValue } from "@liexp/shared/lib/slate";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type KeywordEntity } from "@entities/Keyword.entity";
import { type LinkEntity } from "@entities/Link.entity";
import { type TEFlow } from '@flows/flow.types';

export const createEventFromLink: TEFlow<[LinkEntity, KeywordEntity[]], EventV2Entity> =
  (ctx) =>
  (
    l,
    hashtags
  ) => {
    const suggestedExcerpt = l.description
      ? createExcerptValue(l.description)
      : undefined;

    const publishDate = l.publishDate ?? new Date();
    return pipe(
      ctx.db.save(EventV2Entity, [
        {
          type: "Uncategorized" as const,
          excerpt: suggestedExcerpt,
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
      TE.map((ll) => ll[0])
    );
  };
