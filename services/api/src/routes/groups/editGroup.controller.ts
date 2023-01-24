import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { type Router } from "express";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { Equal } from "typeorm";
import { GroupEntity } from "../../entities/Group.entity";
import { toGroupIO } from "./group.io";
import { type RouteContext } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeEditGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:edit"]))(
    Endpoints.Group.Edit,
    ({ params: { id }, body }) => {
      ctx.logger.debug.log("Updating group with %O", body);

      const groupUpdate = {
        ...body,
        members: body.members.map((m) => {
          if (UUID.is(m)) {
            return {
              id: m,
              group: { id },
            };
          }
          return {
            ...m,
            startDate: m.startDate,
            endDate: O.toNullable(m.endDate),
            actor: { id: m.actor },
            group: { id },
          };
        }),
      };
      return pipe(
        ctx.db.findOneOrFail(GroupEntity, { where: { id: Equal(id) } }),
        TE.chain((group) =>
          ctx.db.save(GroupEntity, [{ ...group, ...groupUpdate, id }])
        ),
        TE.chain(() =>
          ctx.db.findOneOrFail(GroupEntity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["members"],
            },
          })
        ),
        ctx.logger.debug.logInTaskEither("Updated group %O"),
        TE.chainEitherK(toGroupIO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
