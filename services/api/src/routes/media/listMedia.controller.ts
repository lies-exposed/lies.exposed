import { fp } from "@liexp/core/lib/fp";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { fetchManyMedia } from "../../queries/media/fetchManyMedia.query";
import { toMediaIO } from "./media.io";
import { type RouteContext } from "@routes/route.types";

export const MakeListMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Media.List, ({ query }) => {
    ctx.logger.debug.log(`Find Options %O`, query);

    return pipe(
      fetchManyMedia(ctx)({
        ...query,
        events: pipe(query.events, fp.O.filter(fp.A.isNonEmpty)),
      }),
      TE.chain(([data, total]) =>
        pipe(
          data,
          A.map((d) => ({
            ...d,
            links: d.links.map((l) => l.id) as any[],
            events: d.events.map((e) => e.id) as any[],
            keywords: d.keywords.map((e) => e.id) as any[],
          })),
          A.traverse(E.Applicative)((m) =>
            toMediaIO(m, ctx.env.SPACE_ENDPOINT),
          ),
          TE.fromEither,
          TE.map((results) => ({
            total,
            data: results,
          })),
        ),
      ),
      TE.map((body) => ({
        body,
        statusCode: 200,
      })),
    );
  });
};
