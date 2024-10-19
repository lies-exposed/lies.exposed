import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In } from "typeorm";
import { PageEntity } from "../../entities/Page.entity.js";
import { type Route } from "../route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeDeleteManyPageRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    Endpoints.Page.Custom.DeleteMany,
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
