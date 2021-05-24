import { endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { toGroupMemberIO } from "./groupMember.io";

export const MakeCreateGroupMemberRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(endpoints.GroupMember.Create, ({ body }) => {
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
          where: { id: page.id },
          relations: ["actor", "group"],
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
