import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { AdminRead } from "@liexp/shared/lib/io/http/User.js";
import { KeywordIO } from "./keyword.io.js";
import { type ServerContext } from "#context/context.type.js";
import { fetchKeywords } from "#queries/keywords/fetchKeywords.query.js";
import { type Route } from "#routes/route.types.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeListKeywordRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Keyword.List, ({ query }, req) => {
    return pipe(
      fp.RTE.ask<ServerContext>(),
      fp.RTE.chainIOK(
        RequestDecoder.decodeNullableUser(req, [AdminRead.value]),
      ),
      fp.RTE.chain((user) => fetchKeywords(query, !!user)),
      fp.RTE.chainEitherK(([data, total]) =>
        pipe(
          data,
          KeywordIO.decodeMany,
          fp.E.map((results) => ({
            total,
            data: results,
          })),
        ),
      ),
      fp.RTE.map((body) => ({
        body,
        statusCode: 200,
      })),
    )(ctx);
  });
};
