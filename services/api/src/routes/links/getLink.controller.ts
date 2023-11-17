import { fp } from '@liexp/core/lib/fp';
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { RequestDecoder } from "@utils/authenticationHandler";

export const MakeGetLinksRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Link.Get, ({ params: { id } }, req) => {
    const isAdmin = pipe(
      RequestDecoder.decodeNullableUser(ctx)(req, []),
      fp.IO.map((u) => u ? checkIsAdmin(u.permissions) : false)
    )();
    return pipe(
      ctx.db.findOneOrFail(LinkEntity, {
        where: { id: Equal(id) },
        relations: ["image"],
        loadRelationIds: { relations: ["events", "keywords", "creator"] },
        withDeleted: isAdmin,
      }),
      TE.chainEitherK(toLinkIO),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      })),
    );
  });
};
