import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { PageEntity } from "../../entities/Page.entity";
import { Route } from "../route.types";
import { NotFoundError } from "@io/ControllerError";
import { toPageIO } from "./page.io";

export const MakeGetPageRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Page.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOne(PageEntity, { where: { id: Equal(id) } }),
      TE.chain(TE.fromOption(() => NotFoundError("Page"))),
      TE.chainEitherK(toPageIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
