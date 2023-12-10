import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import { type Router } from "express";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { NotFoundError } from "#io/ControllerError.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeDeleteLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:delete"]))(
    Endpoints.Link.Delete,
    ({ params: { id } }, req) => {
      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        TE.map((u) => checkIsAdmin(u.permissions)),
        TE.chain((isAdmin) =>
          pipe(
            ctx.db.findOne(LinkEntity, {
              where: { id: Equal(id) },
              withDeleted: isAdmin,
            }),
            TE.chain(TE.fromOption(() => NotFoundError("Link"))),
            TE.chainFirst((l) =>
              pipe(
                l.deletedAt,
                O.fromNullable,
                O.map((_) => _ !== null),
                O.getOrElse(() => false),
                (b) => {
                  ctx.logger.debug.log("Permanent delete? %b", b);
                  if (b) {
                    return ctx.db.delete(LinkEntity, id);
                  }
                  return ctx.db.softDelete(LinkEntity, id);
                },
              ),
            ),
          ),
        ),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
