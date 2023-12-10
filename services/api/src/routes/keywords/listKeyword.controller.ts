import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { AdminRead } from "@liexp/shared/lib/io/http/User.js";
import { type Router } from "express";
import { toKeywordIO } from "./keyword.io.js";
import { fetchKeywords } from "#queries/keywords/fetchKeywords.query.js";
import { type RouteContext } from "#routes/route.types.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeListKeywordRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Keyword.List, ({ query }, req) => {
    return pipe(
      RequestDecoder.decodeNullableUser(ctx)(req, [AdminRead.value]),
      fp.TE.fromIO,
      fp.TE.chain((user) => fetchKeywords(ctx)(query, !!user)),
      fp.TE.chain(([data, total]) =>
        pipe(
          data,
          fp.A.traverse(fp.E.Applicative)(toKeywordIO),
          fp.TE.fromEither,
          fp.TE.map((results) => ({
            total,
            data: results,
          })),
        ),
      ),
      fp.TE.map((body) => ({
        body,
        statusCode: 200,
      })),
    );
  });
};
