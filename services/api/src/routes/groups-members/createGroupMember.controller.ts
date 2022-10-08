import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Equal } from 'typeorm';
import { Route } from "../route.types";
import { toGroupMemberIO } from "./groupMember.io";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { authenticationHandler } from '@utils/authenticationHandler';

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
