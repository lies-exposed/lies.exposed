import { URL } from "@liexp/shared/io/http/Common";
import { createExcerptValue } from "@liexp/ui/components/Common/Editor";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import TelegramBot from "node-telegram-bot-api";
import * as linkHelpers from "./link.helper";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { LinkEntity } from "@entities/Link.entity";
import { ControllerError, ServerError } from "@io/ControllerError";
import { searchEventV2Query } from "@routes/events/queries/searchEventsV2.query";
import { RouteContext } from "@routes/route.types";

export const createEventSuggestionFromTGMessage =
  (ctx: RouteContext) =>
  (
    message: TelegramBot.Message,
    metadata: TelegramBot.Metadata
  ): TE.TaskEither<ControllerError, EventSuggestionEntity> => {
    ctx.logger.info.log(
      "Received message %O with metadata %O",
      message,
      metadata
    );
    // check url exists and is linked to an event
    //  - if found return the event
    // fetch url metadata and create hashtags when given
    // save the event suggestion

    const urlEntity = (message.entities ?? []).reduce<URL[]>((acc, e) => {
      if (e.type === "url") {
        return acc.concat(message.text?.slice(e.offset, e.length) as any);
      }
      if (e.type === "text_link") {
        return acc.concat(e.url as any);
      }
      return acc;
    }, []);

    const url = pipe(O.fromNullable(urlEntity[0]));

    if (O.isNone(url)) {
      ctx.logger.debug.log("No url given, returning...");
      return TE.left(ServerError(["No url given"]));
    }

    const hashtags = message.entities?.filter((e) => e.type === "hashtag");

    const findLink = pipe(
      ctx.db.findOne(LinkEntity, {
        where: {
          url: url.value,
        },
      }),
      TE.chain((optLink) => {
        if (O.isNone(optLink)) {
          // check exists an "event suggestion" with the given url

          const q = ctx.db.manager
            .createQueryBuilder(EventSuggestionEntity, "eventSuggestion")
            .select()
            .where(
              `"eventSuggestion"."payload"::jsonb -> 'event' -> 'payload' -> 'links' @> ANY(ARRAY[:...links]::jsonb[])`,
              {
                links: [{ url: url.value }],
              }
            );

          ctx.logger.debug.log("Query %O", q.getSql());

          return pipe(
            ctx.db.execQuery(() => q.execute()),
            TE.map((results) => O.fromNullable(results[0])),
            TE.chain((optEventSuggestion) => {
              if (O.isNone(optEventSuggestion)) {
                return pipe(
                  linkHelpers.fetchAndCreate(ctx)(url.value),
                  TE.chain((m) => {
                    const suggestedExcerpt = m.description
                      ? createExcerptValue(m.description)
                      : undefined;

                    const upsertHashtagsT = hashtags
                      ? pipe(
                          hashtags.map((h) =>
                            message.text?.slice(h.offset, h.length)
                          ),
                          TE.right,
                          TE.chain((hh) =>
                            ctx.db.find(KeywordEntity, {
                              where: {
                                tag: hh,
                              },
                            })
                          )
                        )
                      : TE.right([]);

                    return pipe(
                      upsertHashtagsT,
                      TE.chain((hashtags) =>
                        ctx.db.save(EventSuggestionEntity, [
                          {
                            status: "PENDING",
                            payload: {
                              type: "New",
                              event: {
                                type: "Uncategorized" as const,
                                excerpt: suggestedExcerpt,
                                payload: {
                                  title: m.title,
                                  actors: [],
                                  groups: [],
                                  groupsMembers: []
                                },
                                date: m.publishDate ?? new Date(),
                                links: [
                                  {
                                    url: url.value,
                                    publishDate: m.publishDate,
                                  },
                                ],
                                keywords: hashtags,
                              } as any,
                            },
                          },
                        ])
                      ),
                      TE.map((ll) => ll[0])
                    );
                  })
                );
              }
              return TE.right(optEventSuggestion.value);
            })
          );
        }

        ctx.logger.debug.log(
          "Looking for existing events %O",
          optLink.value.id
        );

        return pipe(
          searchEventV2Query(ctx)({
            title: O.none,
            type: O.none,
            startDate: O.none,
            endDate: O.none,
            exclude: O.none,
            withDeleted: false,
            withDrafts: false,
            links: O.some([optLink.value.id]),
            keywords: O.none,
            actors: O.none,
            groups: O.none,
            groupsMembers: O.none,
            media: O.none,
            skip: 0,
            take: 1,
          }),
          TE.map((r) => r.results[0])
        );
      })
    );

    return pipe(findLink);
  };
