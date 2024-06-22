import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import { Route } from "../route.types.js";
import { toAreaIO } from "./Area.io.js";
import { AreaEntity } from "#entities/Area.entity.js";

export const MakeGetAreaRoute: Route = (r, { db, env }) => {
  AddEndpoint(r)(Endpoints.Area.Get, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(AreaEntity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["media", "events"],
        },
        relations: {
          featuredImage: true,
        },
      }),
      TE.chainEitherK((a) => toAreaIO(a, env.SPACE_ENDPOINT)),
      TE.map((area) => ({
        body: {
          data: area,
        },
        statusCode: 200,
      })),
    );
  });
};
