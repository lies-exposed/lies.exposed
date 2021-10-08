import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toScientificStudyIO } from "./scientificStudy.io";
import { ScientificStudyEntity } from "@entities/ScientificStudy.entity";
import { Route } from "@routes/route.types";

export const MakeGetScientificStudyRoute: Route = (r, { db }) => {
  AddEndpoint(r)(Endpoints.ScientifcStudy.Get, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(ScientificStudyEntity, {
        where: { id },
        loadRelationIds: {
          relations: ["authors", "publisher"],
        },
      }),
      TE.chain((result) => TE.fromEither(toScientificStudyIO(result))),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      }))
    );
  });
};
