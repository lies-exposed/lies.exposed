import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { UUID } from "io-ts-types/lib/UUID";
import { GroupEntity } from "../../entities/Group.entity";
import { toGroupIO } from "./group.io";
import * as O from "fp-ts/lib/Option";

export const MakeEditGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Group.Edit, ({ params: { id }, body }) => {
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
      ctx.db.findOneOrFail(GroupEntity, { where: { id } }),
      TE.chain((group) =>
        ctx.db.save(GroupEntity, [{ ...group, ...groupUpdate, id }])
      ),
      TE.chain(() =>
        ctx.db.findOneOrFail(GroupEntity, {
          where: { id },
          loadRelationIds: {
            relations: ['members']
          }
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
  });
};
