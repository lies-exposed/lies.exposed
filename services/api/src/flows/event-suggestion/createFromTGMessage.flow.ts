import { EventV2Entity } from "@entities/Event.v2.entity";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { LinkEntity } from "@entities/Link.entity";
import { ControllerError, ServerError } from "@io/ControllerError";
import { URL } from "@liexp/shared/io/http/Common";
import { searchEventV2Query } from "@routes/events/queries/searchEventsV2.query";
import { RouteContext } from "@routes/route.types";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import TelegramBot from "node-telegram-bot-api";
import { Equal } from "typeorm";
import * as linkHelpers from "../link.flow";
import { createEventSuggestionFromLink } from './createFromLink.flow';
import { searchEventSuggestion } from "./searchEventSuggestion.flow";

export const createFromTGMessage =
  (ctx: RouteContext) =>
  (
    message: TelegramBot.Message,
    metadata: TelegramBot.Metadata
  ): TE.TaskEither<ControllerError, EventSuggestionEntity | EventV2Entity> => {
    ctx.logger.info.log(
      "Received message %O with metadata %O",
      message,
      metadata
    );
    // check url exists and is linked to an event
    //  - if found return the event
    // fetch url metadata and create hashtags when given
    // save the event suggestion

    const urlEntity = (message.entities ?? [])
      .concat(message.caption_entities ?? [])
      .reduce<URL[]>((acc, e) => {
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
            newLinks: O.some([{ url: url.value }]),
            order: {},
          }),
          TE.map(({ data }) => O.fromNullable(data[0])),
          TE.chain((optEventSuggestion) => {
            if (O.isNone(optEventSuggestion)) {
              return pipe(
                linkHelpers.fetchAndCreate(ctx)(url.value),
                TE.chain((m) => {
                  const upsertHashtagsT = hashtags
                    ? pipe(
                        hashtags.map((h) =>
                          message.text?.slice(h.offset, h.length)
                        ),
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
                      createEventSuggestionFromLink(ctx)(m, hashtags)
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

    return pipe(
      findLink,
      TE.mapLeft((e) => {
        ctx.logger.error.log("Error %O", e);
        return e;
      })
    );
  };
