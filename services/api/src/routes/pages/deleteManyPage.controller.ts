import { PageDeleteMany, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { In } from "typeorm";
import { PageEntity } from "../../entities/Page.entity";
import { authenticationHandler } from '@utils/authenticationHandler';
import { RouteContext } from "../route.types";

export const MakeDeleteManyPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ['admin:delete']))(PageDeleteMany, ({ query: { ids } }) => {
    return pipe(
      ctx.db.find(PageEntity, { where: { id: In(ids) } }),
      TE.chainFirst(() => ctx.db.softDelete(PageEntity, ids)),
      TE.map(() => ({
        body: { data: ids },
        statusCode: 200,
      }))
    );
  });
};
