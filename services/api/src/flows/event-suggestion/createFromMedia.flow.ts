import { createExcerptValue } from "@liexp/shared/lib/slate";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { type KeywordEntity } from "@entities/Keyword.entity";
import { type MediaEntity } from "@entities/Media.entity";
import { type TEFlow } from "@flows/flow.types";
/**
 * Create an event suggestion from the given media.
 *
 * It uses the media `description` to create the proper event's `excerpt` value
 */
export const createEventSuggestionFromMedia: TEFlow<
  [MediaEntity[], KeywordEntity[]],
  EventSuggestionEntity
> = (ctx) => (mm, hashtags) => {
  const suggestedExcerpt = mm[0].description
    ? createExcerptValue(mm[0].description)
    : undefined;

  const publishDate = new Date();
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
              title: mm[0].label ?? mm[0].description ?? mm[0].id,
              actors: [],
              groups: [],
              groupsMembers: [],
            },
            date: publishDate,
            links: [],
            media: mm.map((l) => l.id),
            keywords: hashtags.map((k) => k.id),
          },
        },
      },
    ]),
    TE.map((ll) => ll[0]),
  );
};
