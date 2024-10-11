import { flow, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import { type Router } from "express";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal, In } from "typeorm";
import { type RouteContext } from "../route.types.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { NotFoundError } from "#io/ControllerError.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeDeleteLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
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
                    return pipe(
                      l.image,
                      O.fromNullable,
                      O.map((_) =>
                        pipe(
                          ctx.db.findOne(MediaEntity, {
                            where: {
                              id: In([_.id]),
                            },
                          }),
                          TE.chain(
                            flow(
                              O.map((m) => ctx.db.delete(MediaEntity, m.id)),
                              O.getOrElse(() => TE.right({ raw: {} })),
                            ),
                          ),
                        ),
                      ),
                      O.map(
                        flow(TE.chain(() => ctx.db.delete(LinkEntity, id))),
                      ),
                      O.getOrElse(() => TE.right({ raw: {} })),
                    );
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
