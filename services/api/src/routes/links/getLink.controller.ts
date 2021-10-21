import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { RouteContext } from "routes/route.types";

export const MakeGetLinksRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Link.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(LinkEntity, {
        where: { id },
        loadRelationIds: { relations: ["events", "keywords", "links"] },
      }),
      TE.chainEitherK(toLinkIO),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      }))
    );
  });
};
