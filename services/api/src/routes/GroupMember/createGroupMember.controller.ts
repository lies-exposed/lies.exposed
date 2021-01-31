import { endpoints } from "@econnessione/shared";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import * as O from 'fp-ts/lib/Option';
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { toGroupMemberIO } from "./groupMember.io";

export const MakeCreateGroupMemberRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(endpoints.GroupMember.Create, ({ body }) => {
    const group = new GroupEntity()
    group.id = body.group

    const actor = new ActorEntity()
    actor.id = body.actor;
    const saveData = {
      ...body,
      group,
      actor,
      endDate: O.toNullable(body.endDate)
    }
    return pipe(
      db.save(GroupMemberEntity, [saveData]),
      TE.chain(([page]) =>
        db.findOneOrFail(GroupMemberEntity, {
          where: { id: page.id },
          loadRelationIds: true,
        })
      ),
      TE.chainEitherK(toGroupMemberIO),
      TE.map((page) => ({
        body: {
          data: page,
        },
        statusCode: 200,
      }))
    );
  });
};
