import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { GroupEntity } from "../../entities/Group.entity.js";
import { type Route } from "../route.types.js";
import { GroupIO } from "./group.io.js";

export const MakeGetGroupRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Group.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(GroupEntity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["members"],
        },
      }),
      TE.chainEitherK((g) => GroupIO.decodeSingle(g, ctx.env.SPACE_ENDPOINT)),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
