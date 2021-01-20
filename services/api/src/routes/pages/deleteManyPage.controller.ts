import { endpoints } from "@econnessione/shared";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { In } from "typeorm";
import { PageEntity } from "./page.entity";

export const MakeDeleteManyPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Page.DeleteManyPage, ({ query: { ids } }) => {
    return pipe(
      ctx.db.find(PageEntity, { where: { uuid: In(ids) } }),
      TE.chainFirst(() => ctx.db.delete(PageEntity, ids)),
      TE.map(() => ({
        body: { data: ids },
        statusCode: 200,
      }))
    );
  });
};
