import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { GroupEntity } from "../../entities/Group.entity";
import { Route } from "../route.types";
import * as O from "fp-ts/lib/Option";
import { toGroupIO } from "./group.io";

export const MakeCreateGroupRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.Group.Create, ({ body: { color, ...body } }) => {
    return pipe(
      db.save(GroupEntity, [
        {
          ...body,
          color: color.replace("#", ""),
          members: body.members.map((m) => ({
            ...m,
            actor: { id: m.actor },
            endDate: O.toNullable(m.endDate),
          })),
        },
      ]),
      TE.chain(([group]) =>
        db.findOneOrFail(GroupEntity, {
          where: { id: group.id },
        })
      ),
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
