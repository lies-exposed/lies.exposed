import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toKeywordIO } from "./keyword.io";
import { KeywordEntity } from "@entities/Keyword.entity";
import { type RouteContext } from "@routes/route.types";

export const MakeGetKeywordRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Keyword.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(KeywordEntity, {
        where: { id },
        loadRelationIds: true,
      }),
      TE.chainEitherK(toKeywordIO),
      TE.map((actor) => ({
        body: {
          data: actor,
        },
        statusCode: 200,
      }))
    );
  });
};
