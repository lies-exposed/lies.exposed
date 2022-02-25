import { PageDeleteMany, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { In } from "typeorm";
import { PageEntity } from "../../entities/Page.entity";
import { RouteContext } from "../route.types";

export const MakeDeleteManyPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(PageDeleteMany, ({ query: { ids } }) => {
    return pipe(
      ctx.db.find(PageEntity, { where: { uuid: In(ids) } }),
      TE.chainFirst(() => ctx.db.softDelete(PageEntity, ids)),
      TE.map(() => ({
        body: { data: ids },
        statusCode: 200,
      }))
    );
  });
};
