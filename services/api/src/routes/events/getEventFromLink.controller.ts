import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EventSuggestion, Events } from "@liexp/shared/lib/io/http/index.js";
import { toInitialValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import { addWeeks, subWeeks } from "date-fns";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Metadata } from "page-metadata-parser";
import { Equal } from "typeorm";
import { EventV2IO } from "./eventV2.io.js";
import { searchEventV2Query } from "./queries/searchEventsV2.query.js";
import { LinkEntity } from "#entities/Link.entity.js";
import {
  ServerError,
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";
import { type Route } from "#routes/route.types.js";

export const GetEventFromLinkRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.GetFromLink, ({ query: { url } }) => {
    ctx.logger.debug.log("Get event from link %s", url);
    return pipe(
      TE.Do,
      TE.bind("link", () =>
        ctx.db.findOne(LinkEntity, {
          where: {
            url: Equal(url),
          },
        }),
      ),
      TE.bind("metadata", ({ link }) => {
        if (O.isSome(link)) {
          return TE.right<ControllerError, Metadata>({
            date: link.value.publishDate?.toISOString() ?? undefined,
            title: undefined as any,
            description: link.value.description,
            keywords: [],
            icon: "",
            image: link.value.image?.location ?? null,
            provider: link.value.provider ?? "",
            type: "article",
            url: link.value.url,
          });
        }
        return ctx.urlMetadata.fetchMetadata(url, {}, (e) => ServerError());
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
          O.fromNullable(metadata.title),
          O.alt(() =>
            pipe(
              link,
              O.map((l) => l.title),
            ),
          ),
          O.getOrElse(() => ""),
        );

        const suggestedEventLinks = pipe(
          link,
          O.map((l) => [l.id]),
          O.getOrElse((): any[] => [
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
            O.map((l) => [
              {
                type: EventSuggestion.EventSuggestionType.types[0].value,
                event: {
                  ...commonSuggestion,
                  type: Events.EventTypes.DOCUMENTARY.value,
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
                type: EventSuggestion.EventSuggestionType.types[0].value,
                event: {
                  ...commonSuggestion,
                  type: Events.EventTypes.PATENT.value,
                  payload: {
                    title: suggestedTitle,
                    source: l.id,
                    owners: {
                      actors: [],
                      groups: [],
                    } as any,
                  },
                },
              },
              {
                type: EventSuggestion.EventSuggestionType.types[0].value,
                event: {
                  ...commonSuggestion,
                  type: Events.EventTypes.SCIENTIFIC_STUDY.value,
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
            O.getOrElse((): EventSuggestion.CreateEventSuggestion[] => []),
          ),
          {
            type: EventSuggestion.EventSuggestionType.types[0].value,
            event: {
              ...commonSuggestion,
              type: Events.EventTypes.DEATH.value,
              payload: {
                victim: uuid(),
                location: undefined as any,
              },
            },
          },
          {
            type: EventSuggestion.EventSuggestionType.types[0].value,
            event: {
              ...commonSuggestion,
              type: Events.EventTypes.UNCATEGORIZED.value,
              payload: {
                title: suggestedTitle,
                actors: [],
                groups: [],
                groupsMembers: [],
                endDate: undefined as any,
                location: undefined as any,
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
              type: O.none,
              actors: O.none,
              groups: O.none,
              groupsMembers: O.none,
              keywords: O.none,
              media: O.none,
              exclude: O.none,
              links: pipe(
                link,
                O.map((l) => [l.id]),
              ),
              ids: O.none,
              draft: O.none,
              locations: O.none,
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
                  data,
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
