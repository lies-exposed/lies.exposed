import { RequestDecoder } from "@liexp/backend/lib/express/decoders/request.decoder.js";
import { KeywordIO } from "@liexp/backend/lib/io/keyword.io.js";
import { fetchKeywords } from "@liexp/backend/lib/queries/keywords/fetchKeywords.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AdminRead } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { toControllerError } from "../../io/ControllerError.js";
import { type ServerContext } from "#context/context.type.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeListKeywordRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Keyword.List, ({ query }, req) => {
    return pipe(
      fp.RTE.asks((ctx: ServerContext) =>
        RequestDecoder.decodeNullableUser(req, [AdminRead.literals[0]])(ctx)(),
      ),
      fp.RTE.chain((user) =>
        pipe(
          fetchKeywords<ServerContext>(query, !!user),
          fp.RTE.mapLeft(toControllerError),
        ),
      ),
      fp.RTE.chainEitherK(([data, total]) =>
        pipe(
          data,
          KeywordIO.decodeMany,
          fp.E.map((results) => ({
            total,
            data: results,
          })),
          fp.E.mapLeft(toControllerError),
        ),
      ),
      fp.RTE.map((body) => ({
        body,
        statusCode: 200,
      })),
    )(ctx);
  });
};
