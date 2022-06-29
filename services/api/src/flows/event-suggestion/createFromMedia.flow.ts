import { createExcerptValue } from "@liexp/ui/components/Common/Editor";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { MediaEntity } from "@entities/Media.entity";
import { ControllerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
/**
 * Create an event suggestion from the given media.
 *
 * It uses the media `description` to create the proper event's `excerpt` value
 */
export const createEventSuggestionFromMedia =
  (ctx: RouteContext) =>
  (
    mm: MediaEntity[],
    hashtags: KeywordEntity[]
  ): TE.TaskEither<ControllerError, EventSuggestionEntity> => {
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
                title: mm[0].description,
                actors: [],
                groups: [],
                groupsMembers: [],
              },
              date: publishDate,
              links: [],
              media: mm.map((l) => l.id),
              keywords: hashtags,
            },
          },
        },
      ]),
      TE.map((ll) => ll[0])
    );
  };
