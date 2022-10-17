import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { PageEntity } from "../../entities/Page.entity";
import { RouteContext } from "../route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeAddPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.Page.Create,
    ({ body }) => {
      return pipe(
        ctx.db.save(PageEntity, [body]),
        TE.chain(([page]) =>
          sequenceS(TE.taskEither)({
            page: TE.right(page),
          })
        ),
        TE.map(({ page }) => ({
          body: {
            data: {
              ...page,
              // body,
            },
          },
          statusCode: 200,
        }))
      );
    }
  );
};
