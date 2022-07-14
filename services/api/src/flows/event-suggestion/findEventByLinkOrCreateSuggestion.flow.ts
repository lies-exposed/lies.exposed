import { URL } from "@liexp/shared/io/http/Common";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Equal } from "typeorm";
import * as linkFlows from "../link.flow";
import { createEventSuggestionFromLink } from "./createFromLink.flow";
import { searchEventSuggestion } from "./searchEventSuggestion.flow";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { LinkEntity } from "@entities/Link.entity";
import { ControllerError } from "@io/ControllerError";
import { searchEventV2Query } from "@routes/events/queries/searchEventsV2.query";
import { RouteContext } from "@routes/route.types";

export const findEventByLinkOrCreateSuggestion =
  (ctx: RouteContext) =>
  (
    url: URL,
    hashtags: any[]
  ): TE.TaskEither<ControllerError, EventSuggestionEntity | EventV2Entity> => {
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
            optLink.value.id
          );

          return pipe(
            searchEventV2Query(ctx)({
              title: O.none,
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
                event
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
                  }),
                  TE.chain(({ data }) => {
                    ctx.logger.debug.log("Found event suggestions %O", data);

                    if (data.length === 0) {
                      return createEventSuggestionFromLink(ctx)(
                        optLink.value,
                        []
                      );
                    }
                    return TE.right(data[0]);
                  })
                );
              }
            )
          );
        }

        // check exists an "event suggestion" with the given url

        return pipe(
          searchEventSuggestion(ctx)({
            status: O.none,
            links: O.none,
            newLinks: O.some([{ url: url }]),
            order: {},
            skip: 0,
            take: 1,
          }),
          TE.map(({ data }) => O.fromNullable(data[0])),
          TE.chain((optEventSuggestion) => {
            if (O.isNone(optEventSuggestion)) {
              return pipe(
                linkFlows.fetchAndSave(ctx)(url),
                TE.chain((l) => {
                  const upsertHashtagsT = hashtags
                    ? pipe(
                        hashtags,
                        TE.right,
                        TE.chain((hh) =>
                          ctx.db.find(KeywordEntity, {
                            where: {
                              tag: Equal(hh),
                            },
                          })
                        )
                      )
                    : TE.right([]);

                  return pipe(
                    upsertHashtagsT,
                    TE.chain((hashtags) =>
                      createEventSuggestionFromLink(ctx)(l, hashtags)
                    )
                  );
                })
              );
            }
            return TE.right(optEventSuggestion.value);
          })
        );
      })
    );
  };
