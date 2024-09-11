import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { GroupMemberIO } from "./groupMember.io.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeCreateGroupMemberRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler({ logger, jwt }, ["admin:create"]))(
    Endpoints.GroupMember.Create,
    ({ body }) => {
      const saveData = {
        ...body,
        group: { id: body.group },
        actor: { id: body.actor },
        endDate: O.toNullable(body.endDate),
      };
      return pipe(
        db.save(GroupMemberEntity, [saveData]),
        TE.chain(([page]) =>
          db.findOneOrFail(GroupMemberEntity, {
            where: { id: Equal(page.id) },
            relations: ["actor", "group"],
          }),
        ),
        TE.chainEitherK(GroupMemberIO.decodeSingle),
        TE.map((page) => ({
          body: {
            data: page,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
