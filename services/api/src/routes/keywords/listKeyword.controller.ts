import { fp } from "@liexp/core/lib/fp";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { AdminRead } from "@liexp/shared/lib/io/http/User";
import { type Router } from "express";
import { pipe } from "fp-ts/function";
import { toKeywordIO } from "./keyword.io";
import { fetchKeywords } from "@queries/keywords/fetchKeywords.query";
import { type RouteContext } from "@routes/route.types";
import { RequestDecoder } from "@utils/authenticationHandler";

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
