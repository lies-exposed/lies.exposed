import { fp } from "@liexp/core/fp";
import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { type DBError } from "@liexp/shared/providers/orm";
import { type Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type UUID } from "io-ts-types/lib/UUID";
import { fetchManyMedia } from "../../queries/media/fetchManyMedia.query";
import { toImageIO } from "./media.io";
import { searchEventV2Query } from "@routes/events/queries/searchEventsV2.query";
import { type RouteContext } from "@routes/route.types";

export const MakeListMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Media.List, ({ query }) => {
    ctx.logger.debug.log(`Find Options %O`, query);

    const eventsResult = pipe(
      query.events,
      fp.O.map((ids) => TE.right<DBError, UUID[]>(ids)),
      fp.O.alt(() =>
        pipe(
          searchEventV2Query(ctx)({ ...query, type: fp.O.none }),
          fp.TE.map((r) => r.results.map((r) => r.id)),
          fp.O.some
        )
      ),
      fp.O.getOrElse(() => fp.TE.right<DBError, UUID[]>([]))
    );

    return pipe(
      eventsResult,
      TE.chain((events) =>
        fetchManyMedia(ctx)({
          ...query,
          events: pipe(events, fp.O.fromPredicate(fp.A.isNonEmpty)),
        })
      ),
      TE.chain(([data, total]) =>
        pipe(
          data,
          A.map((d) => ({
            ...d,
            links: d.links.map((l) => l.id) as any[],
            events: d.events.map((e) => e.id) as any[],
            keywords: d.keywords.map((e) => e.id) as any[],
          })),
          A.traverse(E.Applicative)(toImageIO),
          TE.fromEither,
          TE.map((results) => ({
            total,
            data: results,
          }))
        )
      ),
      TE.map((body) => ({
        body,
        statusCode: 200,
      }))
    );
  });
};
