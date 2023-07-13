import { fp } from "@liexp/core/lib/fp";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import { pipe } from "fp-ts/function";
import { fetchKeywords } from "../../queries/keywords/fetchKeywords.query";
import { toKeywordIO } from "./keyword.io";
import { type RouteContext } from "@routes/route.types";

export const MakeListKeywordRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Keyword.List, ({ query }) => {
    return pipe(
      fetchKeywords(ctx)(query),
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
