import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from 'typeorm';
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { Route } from "../route.types";
import { authenticationHandler } from '@utils/authenticationHandler';
import { toGroupMemberIO } from "./groupMember.io";

export const MakeCreateGroupMemberRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler({logger, jwt}, ['admin:create']))(Endpoints.GroupMember.Create, ({ body }) => {
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
          where: { id: Equal( page.id) },
          relations: ["actor", "group"],
        })
      ),
      TE.chainEitherK(toGroupMemberIO),
      TE.map((page) => ({
        body: {
          data: page,
        },
        statusCode: 201,
      }))
    );
  });
};
