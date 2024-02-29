import { pipe } from "@liexp/core/lib/fp/index.js";
import { createExcerptValue } from "@liexp/react-page/lib/utils";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventSuggestionEntity } from "#entities/EventSuggestion.entity.js";
import { type KeywordEntity } from "#entities/Keyword.entity.js";
import { type LinkEntity } from "#entities/Link.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { editor } from "#providers/slate";

export const createEventSuggestionFromLink: TEFlow<
  [LinkEntity, KeywordEntity[]],
  EventSuggestionEntity
> = (ctx) => (l, hashtags) => {
  const suggestedExcerpt = l.description
    ? createExcerptValue(editor.liexpSlate)(l.description)
    : undefined;

  const publishDate = l.publishDate ?? new Date();
  return pipe(
    ctx.db.save(EventSuggestionEntity, [
      {
        status: "PENDING",
        payload: {
          type: "New",
          event: {
            type: "Uncategorized" as const,
            excerpt: suggestedExcerpt,
            payload: {
              title: l.title,
              actors: [],
              groups: [],
              groupsMembers: [],
            },
            date: publishDate,
            links: [l.id],
            media: [],
            keywords: hashtags.map((k) => k.id),
          },
        },
      },
    ]),
    TE.map((ll) => ll[0]),
  );
};
