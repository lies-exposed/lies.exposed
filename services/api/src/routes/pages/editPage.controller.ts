import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { PageEntity } from "../../entities/Page.entity.js";
import { type Route } from "../route.types.js";
import { toPageIO } from "./page.io.js";
import { NotFoundError } from "#io/ControllerError.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeEditPageRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.Page.Edit,
    ({ params: { id }, body: { body2, ...editBody } }) => {
      return pipe(
        ctx.db.save(PageEntity, [
          {
            ...editBody,
            body2: body2,
            id,
          },
        ]),
        TE.chain(() =>
          ctx.db.findOne(PageEntity, { where: { id: Equal(id) } }),
        ),
        TE.chain(TE.fromOption(() => NotFoundError("Page"))),
        TE.chainEitherK(toPageIO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
