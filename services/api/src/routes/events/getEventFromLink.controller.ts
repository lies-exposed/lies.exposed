import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Events } from "@liexp/shared/io/http";
import { addWeeks, subWeeks } from "date-fns";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Metadata } from "page-metadata-parser";
import { toEventV2IO } from "./eventV2.io";
import { searchEventV2Query } from "./queries/searchEventsV2.query";
import { LinkEntity } from "@entities/Link.entity";
import { ControllerError, ServerError } from "@io/ControllerError";
import { Route } from "@routes/route.types";

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
          links: TE.right<ControllerError, O.Option<string[]>>(
            pipe(
              link,
              O.map((l) => [l.id])
            )
          ),
        });

        return pipe(
          linkAndMetadata,
          TE.chain(({ links, metadata }) => {
            const urlDate = metadata.date ?? new Date();
            const minDate = subWeeks(urlDate, 1);
            const maxDate = addWeeks(urlDate, 1);

            const suggestions: Events.CreateEventBody[] = [
              {
                type: Events.Uncategorized.UNCATEGORIZED.value,
                excerpt: {},
                body: {},
                draft: true,
                payload: {
                  title: metadata.title,
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
                links,
                startDate: O.some(minDate),
                endDate: O.some(maxDate),
                title: O.fromNullable(metadata.title)
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
