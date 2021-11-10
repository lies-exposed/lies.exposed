import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toScientificStudyIO } from "./scientificStudy.io";
import { ScientificStudyEntity } from "@entities/ScientificStudy.entity";
import { Route } from "@routes/route.types";
import { getORMOptions } from "@utils/listQueryToORMOptions";

export const MakeListScientificStudyRoute: Route = (r, { db, logger, env }) => {
  AddEndpoint(r)(
    Endpoints.ScientificStudy.List,
    ({ query: { publishedDate, publishedBy, ...query } }) => {
      const queryOptions = getORMOptions({ ...query }, env.DEFAULT_PAGE_SIZE);

      const findTask = pipe(
        db.manager
          .createQueryBuilder(ScientificStudyEntity, "scientificStudies")
          .loadAllRelationIds(),
        (q) => {
          if (O.isSome(publishedDate)) {
            return q.andWhere("scientificStudies.publishDate = :date", {
              date: publishedDate.value,
            });
          }
          return q;
        },
        (q) => {
          if (O.isSome(publishedBy)) {
            return q.innerJoinAndSelect(
              "scientificStudies.publishedBy",
              "publishedBy",
              "publishedBy.id IN (:...links)",
              {
                publishedBy: publishedBy.value,
              }
            );
          }
          return q;
        },
        (q) => {
          return db.execQuery(() =>
            q.skip(queryOptions.skip).take(queryOptions.take).getManyAndCount()
          );
        }
      );
      return pipe(
        findTask,
        TE.chain(([results, total]) =>
          pipe(
            A.sequence(TE.ApplicativeSeq)(
              results.map((r) => TE.fromEither(toScientificStudyIO(r)))
            ),
            TE.map((data) => ({ data, total }))
          )
        ),
        TE.map(({ data, total }) => ({
          body: {
            data,
            total,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
