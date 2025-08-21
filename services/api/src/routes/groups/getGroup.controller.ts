import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetGroupRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Group.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(GroupEntity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["members"],
        },
      }),
      TE.chainEitherK((g) => GroupIO.decodeSingle(g)),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
