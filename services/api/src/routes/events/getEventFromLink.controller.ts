import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { EventSuggestion } from "@liexp/shared/lib/io/http/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { addWeeks, subWeeks } from "date-fns";
import * as O from "effect/Option";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Metadata } from "page-metadata-parser";
import { Equal } from "typeorm";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const GetEventFromLinkRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.GetFromLink, ({ query: { url } }) => {
    ctx.logger.debug.log("Get event from link %s", url);
    return pipe(
      TE.Do,
      TE.bind("link", () =>
        ctx.db.findOne<LinkEntity & { image?: MediaEntity }>(LinkEntity, {
          where: {
            url: Equal(url),
          },
          relations: ["image"],
        }),
      ),
      TE.bind("metadata", ({ link }) => {
        if (fp.O.isSome(link)) {
          return TE.right<ControllerError, Metadata>({
            date: link.value.publishDate?.toISOString() ?? undefined,
            title: link.value.title,
            description: link.value.description ?? link.value.title,
            keywords: [],
            icon: "",
            image: link.value.image?.location ?? null,
            provider: link.value.provider ?? "",
            type: "article",
            url: link.value.url,
          });
        }
        return ctx.urlMetadata.fetchMetadata(url, {}, (e) =>
          ServerError.fromUnknown(e),
        );
      }),
      TE.bind("excerpt", ({ metadata }) => {
        if (metadata.description) {
          return pipe(
            toInitialValue(metadata.description),
            TE.right,
            TE.mapLeft(toControllerError),
          );
        }
        return TE.right(null);
      }),
      TE.bind("suggestions", ({ metadata, link, excerpt }) => {
        ctx.logger.debug.log("Link %O with metadata %O", link, metadata);
        const urlDate = metadata.date ? new Date(metadata.date) : new Date();
        const minDate = subWeeks(urlDate, 1);
        const maxDate = addWeeks(urlDate, 1);

        const suggestedTitle = pipe(
          fp.O.fromNullable(metadata.title),
          fp.O.alt(() =>
            pipe(
              link,
              fp.O.map((l) => l.title),
            ),
          ),
          fp.O.getOrElse(() => ""),
        );

        const suggestedEventLinks = pipe(
          link,
          fp.O.map((l) => [l.id]),
          fp.O.getOrElse((): any[] => [
            {
              url: metadata.url,
              publishDate: urlDate.toISOString(),
            },
          ]),
        );

        const commonSuggestion = {
          id: uuid(),
          excerpt: excerpt,
          body: null,
          draft: true,
          date: urlDate,
          media: [],
          links: [],
          newLinks: suggestedEventLinks,
          keywords: [],
          socialPosts: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: undefined,
        };

        const suggestions: EventSuggestion.CreateEventSuggestion[] = [
          ...pipe(
            link,
            fp.O.map((l) => [
              {
                type: EventSuggestion.EventSuggestionType.members[0]
                  .literals[0],
                event: {
                  ...commonSuggestion,
                  type: EVENT_TYPES.DOCUMENTARY,
                  payload: {
                    title: suggestedTitle,
                    website: l.id,
                    media: uuid(),
                    authors: {
                      actors: [],
                      groups: [],
                    },
                    subjects: {
                      actors: [],
                      groups: [],
                    },
                  },
                },
              },
              {
                type: EventSuggestion.EventSuggestionType.members[0]
                  .literals[0],
                event: {
                  ...commonSuggestion,
                  type: EVENT_TYPES.PATENT,
                  payload: {
                    title: suggestedTitle,
                    source: l.id,
                    owners: {
                      actors: [],
                      groups: [],
                    },
                  },
                },
              },
              {
                type: EventSuggestion.EventSuggestionType.members[0]
                  .literals[0],
                event: {
                  ...commonSuggestion,
                  type: EVENT_TYPES.SCIENTIFIC_STUDY,
                  payload: {
                    title: suggestedTitle,
                    url: l.id,
                    image: undefined,
                    publisher: undefined,
                    authors: [],
                  },
                },
              },
            ]),
            fp.O.getOrElse((): EventSuggestion.CreateEventSuggestion[] => []),
          ),
          {
            type: EventSuggestion.EventSuggestionType.members[0].literals[0],
            event: {
              ...commonSuggestion,
              type: EVENT_TYPES.DEATH,
              payload: {
                victim: uuid(),
                location: undefined,
              },
            },
          },
          {
            type: EventSuggestion.EventSuggestionType.members[0].literals[0],
            event: {
              ...commonSuggestion,
              type: EVENT_TYPES.UNCATEGORIZED,
              payload: {
                title: suggestedTitle,
                actors: [],
                groups: [],
                groupsMembers: [],
                endDate: undefined,
                location: undefined,
              },
            },
          },
        ];

        return TE.right({ suggestions, minDate, maxDate });
      }),
      TE.chain(
        ({
          metadata,
          link,
          suggestions: { suggestions, minDate, maxDate },
        }) => {
          return pipe(
            searchEventV2Query({
              withDeleted: false,
              withDrafts: false,
              skip: 0,
              take: 10,
              type: O.none(),
              actors: O.none(),
              groups: O.none(),
              groupsMembers: O.none(),
              keywords: O.none(),
              media: O.none(),
              exclude: O.none(),
              links: pipe(
                link,
                fp.O.toNullable,
                O.fromNullable,
                O.map((l) => [l.id]),
              ),
              ids: O.none(),
              draft: O.none(),
              locations: O.none(),
              startDate: O.some(minDate),
              endDate: O.some(maxDate),
              q: O.fromNullable(metadata.title),
            })(ctx),
            LoggerService.TE.debug(ctx, "Events %O"),
            TE.chain(({ results, firstDate, lastDate, ...rest }) =>
              pipe(
                results,
                EventV2IO.decodeMany,
                E.map((data) => ({
                  data: data.map((d) => ({ ...d, score: 1 })),
                  suggestions,
                  firstDate: firstDate?.toISOString(),
                  lastDate: lastDate?.toISOString(),
                  ...rest,
                })),
                TE.fromEither,
              ),
            ),
          );
        },
      ),
      TE.map((body) => ({
        body,
        statusCode: 200,
      })),
    );
  });
};
