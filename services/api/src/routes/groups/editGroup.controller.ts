import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { GroupEntity } from "../../entities/Group.entity.js";
import { GroupIO } from "./group.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeEditGroupRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.Group.Edit,
    ({ params: { id }, body: { members, avatar, ...body } }) => {
      ctx.logger.debug.log("Updating group with %O", body);

      const groupUpdate = {
        ...body,
        avatar: UUID.is(avatar)
          ? { id: avatar }
          : {
              ...avatar,
              events: [],
              links: [],
              keywords: [],
              areas: [],
              stories: [],
            },
        members: members.map((m) => {
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
          ctx.db.save(GroupEntity, [{ ...group, ...groupUpdate, id }]),
        ),
        TE.chain(() =>
          ctx.db.findOneOrFail(GroupEntity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["members"],
            },
          }),
        ),
        // ctx.logger.debug.logInTaskEither("Updated group %O"),
        TE.chainEitherK((g) => GroupIO.decodeSingle(g, ctx.env.SPACE_ENDPOINT)),
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
