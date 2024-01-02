import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { fetchManyMedia } from "../../queries/media/fetchManyMedia.query.js";
import { toMediaIO } from "./media.io.js";
import { type RouteContext } from "#routes/route.types.js";

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
            areas: d.areas.map((e) => e.id) as any[],
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
