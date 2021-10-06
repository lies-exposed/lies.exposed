import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toDeathIO } from "./death.io";
import { DeathEventEntity } from "@entities/DeathEvent.entity";
import { Route } from "@routes/route.types";

export const MakeGetListDeathEventRoute: Route = (
  r,
  { s3, db, env, logger }
) => {
  AddEndpoint(r)(
    Endpoints.DeathEvent.List,
    ({ query: { victim, ...query } }) => {
      logger.debug.log("Victim is %O", victim);
      const selectSQLTask = pipe(
        db.manager
          .createQueryBuilder(DeathEventEntity, "deaths")
          .leftJoinAndSelect("deaths.victim", "victim")
          .loadAllRelationIds(),
        (q) => {
          if (O.isSome(victim)) {
            return q.andWhere("victim.id = :victimId", {
              victimId: victim.value,
            });
          }
          return q;
        },
        (q) => {
          logger.debug.log("Get List SQL", q.getSql());
          return q;
        },
        (q) => db.execQuery(() => q.getManyAndCount())
      );

      return pipe(
        selectSQLTask,
        TE.chain(([results, total]) =>
          pipe(
            results,
            A.traverse(E.Applicative)(toDeathIO),
            TE.fromEither,
            TE.map((data) => ({ data, total }))
          )
        ),
        TE.map((body) => ({
          body,
          statusCode: 200,
        }))
      );
    }
  );
};
