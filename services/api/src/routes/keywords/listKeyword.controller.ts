import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { AdminRead } from "@liexp/shared/lib/io/http/User.js";
import { type Router } from "express";
import { KeywordIO } from "./keyword.io.js";
import { fetchKeywords } from "#queries/keywords/fetchKeywords.query.js";
import { type RouteContext } from "#routes/route.types.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeListKeywordRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Keyword.List, ({ query }, req) => {
    return pipe(
      fp.RTE.ask<RouteContext>(),
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
