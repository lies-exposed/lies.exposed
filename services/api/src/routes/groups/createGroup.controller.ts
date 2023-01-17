import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { GroupEntity } from "../../entities/Group.entity";
import { Route } from "../route.types";
import { toGroupIO } from "./group.io";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeCreateGroupRoute: Route = (r, { db, jwt, logger }) => {
  AddEndpoint(r, authenticationHandler({ logger, jwt }, ["admin:create"]))(
    Endpoints.Group.Create,
    ({ body: { color, ...body } }) => {
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
            where: { id: Equal(group.id) },
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
    }
  );
};
