import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { PageEntity } from "../../entities/Page.entity";
import { RouteContext } from "../route.types";
import { NotFoundError } from "@io/ControllerError";
import { authenticationHandler } from '@utils/authenticationHandler';

export const MakeEditPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ['admin:edit']))(Endpoints.Page.Edit, ({ params: { id }, body }) => {
    return pipe(
      ctx.db.save(PageEntity, [
        {
          ...body,
          id,
        },
      ]),
      TE.chain(() => ctx.db.findOne(PageEntity, { where: { id: Equal(id) } })),
      TE.chain(TE.fromOption(() => NotFoundError("Page"))),
      TE.map(({ body, ...page }) => ({
        body: {
          data: {
            ...page,
            body,
          },
        },
        statusCode: 200,
      }))
    );
  });
};
