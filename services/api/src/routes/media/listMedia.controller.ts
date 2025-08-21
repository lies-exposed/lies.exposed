import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as O from "effect/Option";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { fetchManyMedia } from "../../queries/media/fetchManyMedia.query.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeListMediaRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Media.List, ({ query }) => {
    ctx.logger.debug.log(`Find Options %O`, query);

    return pipe(
      fetchManyMedia({
        ...query,
        events: pipe(query.events, O.filter(fp.A.isNonEmpty)),
      })(ctx),
      TE.chainEitherK(([data, total]) =>
        pipe(
          data,
          fp.A.map((d) => ({
            ...d,
            links: d.links.map((l) => l.id) as any[],
            events: d.events.map((e) => e.id) as any[],
            keywords: d.keywords.map((e) => e.id) as any[],
            areas: d.areas.map((e) => e.id) as any[],
          })),
          (mm) => MediaIO.decodeMany(mm),
          E.map((results) => ({
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
