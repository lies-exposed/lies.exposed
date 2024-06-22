import { pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import * as linkFlows from "../links/link.flow.js";
import { createEventSuggestionFromLink } from "./createFromLink.flow.js";
import { searchEventSuggestion } from "./searchEventSuggestion.flow.js";
import { type EventV2Entity } from "#entities/Event.v2.entity.js";
import { type EventSuggestionEntity } from "#entities/EventSuggestion.entity.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { UserEntity } from "#entities/User.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { type ControllerError } from "#io/ControllerError.js";
import { searchEventV2Query } from "#routes/events/queries/searchEventsV2.query.js";

export const findEventByLinkOrCreateSuggestion: TEFlow<
  [URL, any[]],
  EventSuggestionEntity | EventV2Entity
> = (ctx) => (url, hashtags) => {
  return pipe(
    ctx.db.findOne(LinkEntity, {
      where: {
        url: Equal(url),
      },
    }),
    TE.chain((optLink) => {
      if (O.isSome(optLink)) {
        ctx.logger.debug.log(
          "Looking for existing events with url %s (%s)",
          optLink.value.url,
          optLink.value.id,
        );

        return pipe(
          searchEventV2Query(ctx)({
            ids: O.none,
            q: O.none,
            type: O.none,
            draft: O.none,
            startDate: O.none,
            endDate: O.none,
            exclude: O.none,
            withDeleted: true,
            withDrafts: true,
            links: O.some([optLink.value.id]),
            keywords: O.none,
            actors: O.none,
            groups: O.none,
            groupsMembers: O.none,
            media: O.none,
            locations: O.none,
            skip: 0,
            take: 1,
          }),
          TE.map((r) => r.results[0]),
          TE.chain(
            (
              event,
            ): TE.TaskEither<
              ControllerError,
              EventV2Entity | EventSuggestionEntity
            > => {
              if (event) {
                return TE.right(event);
              }
              return pipe(
                searchEventSuggestion(ctx)({
                  status: O.none,
                  links: O.some([optLink.value.id]),
                  newLinks: O.none,
                  order: {},
                  skip: 0,
                  take: 5,
                  creator: O.none,
                }),
                TE.chain(({ data }) => {
                  ctx.logger.debug.log("Found event suggestions %O", data);

                  if (data.length === 0) {
                    return createEventSuggestionFromLink(ctx)(
                      optLink.value,
                      [],
                    );
                  }
                  return TE.right(data[0]);
                }),
              );
            },
          ),
        );
      }

      // check exists an "event suggestion" with the given url

      return pipe(
        searchEventSuggestion(ctx)({
          status: O.none,
          links: O.none,
          newLinks: O.some([{ url }]),
          order: {},
          skip: 0,
          take: 1,
          creator: O.none,
        }),
        TE.map(({ data }) => O.fromNullable(data[0])),
        TE.chain((optEventSuggestion) => {
          if (O.isNone(optEventSuggestion)) {
            return pipe(
              linkFlows.fetchAndSave(ctx)(new UserEntity(), url),
              TE.chain((l) => {
                const upsertHashtagsT = hashtags
                  ? pipe(
                      hashtags,
                      TE.right,
                      TE.chain((hh) =>
                        ctx.db.find(KeywordEntity, {
                          where: {
                            tag: Equal(hh[0]),
                          },
                        }),
                      ),
                    )
                  : TE.right([]);

                return pipe(
                  upsertHashtagsT,
                  TE.chain((hashtags) =>
                    createEventSuggestionFromLink(ctx)(l, hashtags),
                  ),
                );
              }),
            );
          }
          return TE.right(optEventSuggestion.value);
        }),
      );
    }),
  );
};
