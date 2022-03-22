import { LinkEntity } from "@entities/Link.entity";
import { ControllerError, ServerError } from "@io/ControllerError";
import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Events } from "@liexp/shared/io/http";
import { uuid } from "@liexp/shared/utils/uuid";
import { Route } from "@routes/route.types";
import { addWeeks, subWeeks } from "date-fns";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { Metadata } from "page-metadata-parser";
import { toEventV2IO } from "./eventV2.io";
import { searchEventV2Query } from "./queries/searchEventsV2.query";

export const MakeGetEventFromLinkRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.GetFromLink, ({ query: { url } }) => {
    ctx.logger.debug.log("Get event from link %s", url);
    return pipe(
      ctx.db.findOne(LinkEntity, {
        where: {
          url,
        },
      }),
      TE.chain((link) => {
        const linkAndMetadata = sequenceS(TE.ApplicativePar)({
          metadata: O.isSome(link)
            ? TE.right<ControllerError, Metadata>({
                date: link.value.publishDate ?? undefined,
                title: undefined as any,
                description: link.value.description,
                keywords: [],
                icon: "",
                image: link.value.image ?? "",
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
            const urlDate = metadata.date ?? new Date();
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

            const suggestions: Events.CreateEventBody[] = [
              {
                type: Events.Documentary.DOCUMENTARY.value,
                excerpt: {},
                body: {},
                draft: true,
                date: urlDate,
                payload: {
                  title: suggestedTitle,
                  website: metadata.url,
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
                media: [],
                links: [],
                keywords: [],
              },
              {
                type: Events.Patent.PATENT.value,
                excerpt: {},
                body: {},
                draft: true,
                date: urlDate,
                payload: {
                  title: suggestedTitle,
                  source: metadata.url as any,
                  owners: {
                    actors: [],
                    groups: [],
                  } as any,
                },
                media: [],
                links: [],
                keywords: [],
              },
              {
                type: Events.ScientificStudy.SCIENTIFIC_STUDY.value,
                excerpt: {},
                body: {},
                draft: true,
                date: urlDate,
                payload: {
                  title: suggestedTitle,
                  url: metadata.url as any,
                  image: metadata.image,
                  publisher: undefined,
                  authors: [],
                },
                media: [],
                links: [],
                keywords: [],
              },
              {
                type: Events.Death.DEATH.value,
                excerpt: {},
                body: {},
                draft: true,
                date: urlDate,
                payload: {
                  victim: uuid() as any,
                  location: undefined as any,
                },
                media: [],
                keywords: [],
                links: pipe(
                  link,
                  O.map((l) => [{ url: l.url }]),
                  O.getOrElse((): any[] => [])
                ),
              },
              {
                type: Events.Uncategorized.UNCATEGORIZED.value,
                excerpt: {},
                body: {},
                draft: true,
                payload: {
                  title: pipe(
                    link,
                    O.map((l) => l.title),
                    O.getOrElse(() => metadata.title)
                  ),
                  actors: [],
                  groups: [],
                  groupsMembers: [],
                  endDate: undefined as any,
                  location: undefined as any,
                },
                date: urlDate,
                keywords: [],
                links: [],
                media: [],
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
                links: pipe(
                  link,
                  O.map((l) => [l.id])
                ),
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
        body: body,
        statusCode: 200,
      }))
    );
  });
};
