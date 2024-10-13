import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  PageDeleteMany,
  AddEndpoint,
} from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In } from "typeorm";
import { PageEntity } from "../../entities/Page.entity.js";
import { type RouteContext } from "../route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeDeleteManyPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    PageDeleteMany,
    ({ query: { ids } }) => {
      return pipe(
        ctx.db.find(PageEntity, { where: { id: In(ids) } }),
        TE.chainFirst(() => ctx.db.softDelete(PageEntity, ids)),
        TE.map(() => ({
          body: { data: ids },
          statusCode: 200,
        })),
      );
    },
  );
};
