import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { MediaEntity } from '@entities/Media.entity';
import { ControllerError } from "@io/ControllerError";
import { createExcerptValue } from "@liexp/ui/components/Common/Editor";
import { RouteContext } from "@routes/route.types";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
/**
 * Create an event suggestion from the given media.
 *
 * It uses the media `description` to create the proper event's `excerpt` value
 */
export const createEventSuggestionFromMedia =
  (ctx: RouteContext) =>
  (
    l: MediaEntity,
    hashtags: KeywordEntity[]
  ): TE.TaskEither<ControllerError, EventSuggestionEntity> => {
    const suggestedExcerpt = l.description
      ? createExcerptValue(l.description)
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
                title: l.description,
                actors: [],
                groups: [],
                groupsMembers: [],
              },
              date: publishDate,
              links: [],
              media: [l.id],
              keywords: hashtags,
            },
          },
        },
      ]),
      TE.map((ll) => ll[0])
    );
  };
