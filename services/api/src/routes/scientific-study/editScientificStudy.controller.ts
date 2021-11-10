import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toScientificStudyIO } from "./scientificStudy.io";
import { ScientificStudyEntity } from "@entities/ScientificStudy.entity";
import { ServerError } from "@io/ControllerError";
import { Route } from "@routes/route.types";

export const MakeEditScientificStudyRoute: Route = (
  r,
  { db, logger, urlMetadata }
) => {
  AddEndpoint(r)(Endpoints.ScientificStudy.Edit, ({ params: { id }, body }) => {
    const scientificStudyData = {
      ...body,
      abstract: O.toUndefined(body.abstract),
      results: O.toUndefined(body.results),
      authors: body.authors.map((a) => ({ id: a })),
      publisher: { id: body.publisher },
    };

    return pipe(
      urlMetadata.fetchMetadata(body.url, (e) => ServerError()),
      TE.chain((meta) =>
        db.save(ScientificStudyEntity, [
          { ...scientificStudyData, title: meta.title ?? body.title, id },
        ])
      ),
      TE.chain(([result]) =>
        db.findOneOrFail(ScientificStudyEntity, {
          where: { id: result.id },
          loadRelationIds: true,
        })
      ),
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
