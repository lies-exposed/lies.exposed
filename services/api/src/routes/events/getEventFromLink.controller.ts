import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { addWeeks, subWeeks } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toEventV2IO } from "./eventV2.io";
import { searchEventV2Query } from "./queries/searchEventsV2.query";
import { ServerError } from "@io/ControllerError";
import { Route } from "@routes/route.types";

export const MakeGetEventFromLinkRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.GetFromLink, ({ query: { url } }) => {
    ctx.logger.debug.log("Get event from link %s", url);
    return pipe(
      ctx.urlMetadata.fetchMetadata(url, {}, (e) => ServerError()),
      TE.chain((metadata) => {
        const urlDate = metadata.date ?? new Date();
        const minDate = subWeeks(urlDate, 1);
        const maxDate = addWeeks(urlDate, 1);

        return searchEventV2Query(ctx)({
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
          links: O.none,
          startDate: O.some(minDate),
          endDate: O.some(maxDate),
          title: O.some(metadata.title ?? ""),
        });
      }),
      ctx.logger.debug.logInTaskEither("Events %O"),
      TE.chain(({ results, ...rest }) =>
        pipe(
          results,
          A.map(toEventV2IO),
          A.sequence(E.Applicative),
          E.map((data) => ({ data, ...rest })),
          TE.fromEither
        )
      ),
      TE.map((body) => ({
        body: body,
        statusCode: 200,
      }))
    );
  });
};
