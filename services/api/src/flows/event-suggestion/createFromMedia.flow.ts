import { pipe } from "@liexp/core/lib/fp/index.js";
import { toInitialValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventSuggestionEntity } from "#entities/EventSuggestion.entity.js";
import { type KeywordEntity } from "#entities/Keyword.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";
/**
 * Create an event suggestion from the given media.
 *
 * It uses the media `description` to create the proper event's `excerpt` value
 */
export const createEventSuggestionFromMedia =
  (
    mm: MediaEntity[],
    hashtags: KeywordEntity[],
  ): TEReader<EventSuggestionEntity> =>
  (ctx) => {
    const publishDate = new Date();
    return pipe(
      toInitialValue(mm[0]?.description),
      TE.right,
      TE.mapLeft(toControllerError),
      TE.chain((excerpt) =>
        ctx.db.save(EventSuggestionEntity, [
          {
            status: "PENDING",
            payload: {
              type: "New",
              event: {
                type: "Uncategorized" as const,
                excerpt,
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
      ),
      TE.map((ll) => ll[0]),
    );
  };
