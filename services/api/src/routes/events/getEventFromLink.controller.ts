import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { Events, EventSuggestion } from "@liexp/shared/lib/io/http";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import { addWeeks, subWeeks } from "date-fns";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type Metadata } from "page-metadata-parser";
import { Equal } from "typeorm";
import { toEventV2IO } from "./eventV2.io";
import { searchEventV2Query } from "./queries/searchEventsV2.query";
import { LinkEntity } from "@entities/Link.entity";
import { type ControllerError, ServerError } from "@io/ControllerError";
import { type Route } from "@routes/route.types";

export const GetEventFromLinkRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.GetFromLink, ({ query: { url } }) => {
    ctx.logger.debug.log("Get event from link %s", url);
    return pipe(
      ctx.db.findOne(LinkEntity, {
        where: {
          url: Equal(url),
        },
      }),
      TE.chain((link) => {
        const linkAndMetadata = sequenceS(TE.ApplicativePar)({
          metadata: O.isSome(link)
            ? TE.right<ControllerError, Metadata>({
                date: link.value.publishDate?.toISOString() ?? undefined,
                title: undefined as any,
                description: link.value.description,
                keywords: [],
                icon: "",
                image: link.value.image?.location ?? null,
                provider: link.value.provider,
                type: "article",
                url: link.value.url,
              })
            : ctx.urlMetadata.fetchMetadata(url, {}, (e) => ServerError()),
          link: TE.right<ControllerError, O.Option<LinkEntity>>(link),
        });

        return pipe(
          linkAndMetadata,
          TE.chain(({ link, metadata }) => {
            ctx.logger.debug.log("Link %O with metadata %O", link, metadata);
            const urlDate = metadata.date
              ? new Date(metadata.date)
              : new Date();
            const minDate = subWeeks(urlDate, 1);
            const maxDate = addWeeks(urlDate, 1);

            const suggestedTitle = pipe(
              O.fromNullable(metadata.title),
              O.alt(() =>
                pipe(
                  link,
                  O.map((l) => l.title)
                )
              ),
              O.getOrElse(() => "")
            );

            const suggestedExcerpt = metadata.description
              ? createExcerptValue(metadata.description)
              : undefined;

            const suggestedEventLinks = pipe(
              link,
              O.map((l) => [l.id]),
              O.getOrElse((): any[] => [
                {
                  url: metadata.url,
                  publishDate: urlDate.toISOString(),
                },
              ])
            );

            const commonSuggestion = {
              id: uuid() as any,
              excerpt: suggestedExcerpt,
              body: {},
              draft: true,
              date: urlDate,
              media: [],
              links: [],
              newLinks: suggestedEventLinks,
              keywords: [],
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
                      type: Events.Documentary.DOCUMENTARY.value,
                      payload: {
                        title: suggestedTitle,
                        website: l.id,
                        media: uuid() as any,
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
                      type: Events.Patent.PATENT.value,
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
                      type: Events.ScientificStudy.SCIENTIFIC_STUDY.value,
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
                O.getOrElse((): EventSuggestion.CreateEventSuggestion[] => [])
              ),
              {
                type: EventSuggestion.EventSuggestionType.types[0].value,
                event: {
                  ...commonSuggestion,
                  type: Events.Death.DEATH.value,
                  payload: {
                    victim: uuid() as any,
                    location: undefined as any,
                  },
                },
              },
              {
                type: EventSuggestion.EventSuggestionType.types[0].value,
                event: {
                  ...commonSuggestion,
                  type: Events.Uncategorized.UNCATEGORIZED.value,
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

            return pipe(
              searchEventV2Query(ctx)({
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
                  O.map((l) => [l.id])
                ),
                ids: O.none,
                draft: O.none,
                locations: O.none,
                startDate: O.some(minDate),
                endDate: O.some(maxDate),
                title: O.fromNullable(metadata.title),
              }),
              ctx.logger.debug.logInTaskEither("Events %O"),
              TE.chain(({ results, ...rest }) =>
                pipe(
                  results,
                  A.map(toEventV2IO),
                  A.sequence(E.Applicative),
                  E.map((data) => ({ data, suggestions, ...rest })),
                  TE.fromEither
                )
              )
            );
          })
        );
      }),
      TE.map((body) => ({
        body,
        statusCode: 200,
      }))
    );
  });
};
