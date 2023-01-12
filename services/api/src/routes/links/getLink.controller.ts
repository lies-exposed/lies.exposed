import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { RouteContext } from "../route.types";
import { LinkEntity } from "@entities/Link.entity";
import { toLinkIO } from "./link.io";

export const MakeGetLinksRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Link.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(LinkEntity, {
        where: { id: Equal(id) },
        relations: ["image"],
        loadRelationIds: { relations: ["events", "keywords", "creator"] },
      }),
      TE.chainEitherK(toLinkIO),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      }))
    );
  });
};
