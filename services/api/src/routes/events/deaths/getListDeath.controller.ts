import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { formatISO } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toDeathIO } from "./death.io";
import { DeathEventEntity } from "@entities/DeathEvent.entity";
import { Route } from "@routes/route.types";
import { getORMOptions } from "@utils/listQueryToORMOptions";

export const MakeGetListDeathEventRoute: Route = (r, { db, logger, env }) => {
  AddEndpoint(r)(
    Endpoints.DeathEvent.List,
    ({ query: { victim, date, ...query } }) => {
      logger.debug.log("Victim is %O", victim);
      const ormOptions = getORMOptions({ ...query }, env.DEFAULT_PAGE_SIZE);
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

          if (O.isSome(date)) {
            return q.andWhere("date(deaths.date) = :date", {
              date: formatISO(date.value, { representation: "date" }),
            });
          }
          return q;
        },
        (q) => q.skip(ormOptions.skip).take(ormOptions.take),
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
