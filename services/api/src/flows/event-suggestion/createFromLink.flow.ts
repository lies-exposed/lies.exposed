import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { LinkEntity } from "@entities/Link.entity";
import { ControllerError } from "@io/ControllerError";
import { createExcerptValue } from "@liexp/ui/components/Common/Editor";
import { RouteContext } from "@routes/route.types";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

export const createEventSuggestionFromLink =
  (ctx: RouteContext) =>
  (
    l: LinkEntity,
    hashtags: KeywordEntity[]
  ): TE.TaskEither<ControllerError, EventSuggestionEntity> => {
    const suggestedExcerpt = l.description
      ? createExcerptValue(l.description)
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
              keywords: hashtags,
            },
          },
        },
      ]),
      TE.map((ll) => ll[0])
    );
  };