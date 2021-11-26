import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { SearchEvent } from "@econnessione/shared/io/http/Events";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { In } from "typeorm";
import { toSearchEventIO } from "./searchEvent.io";
import { searchEventSQL } from "./searchEvent.sql";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { ControllerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import { getORMOptions } from "@utils/listQueryToORMOptions";

export const MakeSearchEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Event.Custom.Search, ({ query }) => {
    ctx.logger.debug.log("Query %O", query);
    const {
      actors,
      groups,
      groupsMembers,
      links,
      keywords,
      media,
      startDate,
      endDate,
      ...queryRest
    } = query;
    const findOptions = getORMOptions(
      {
        ...queryRest,
        _sort: pipe(
          queryRest._sort,
          O.alt(() => O.some("startDate"))
        ),
      },
      ctx.env.DEFAULT_PAGE_SIZE
    );

    ctx.logger.debug.log(`Find options conditions: %O`, {
      actors,
      groups,
      groupsMembers,
      ...findOptions,
    });

    const sqlTask = (
      input: typeof query
    ): TE.TaskEither<
      ControllerError,
      [any[], { events: number; deaths: number; scientificStudies: number }]
    > => {
      ctx.logger.debug.log(`Search input %O`, input);

      const querySql = searchEventSQL({
        groups: pipe(
          input.groups,
          O.getOrElse((): string[] => [])
        ),
        actors: pipe(
          input.actors,
          O.getOrElse((): string[] => [])
        ),
        groupsMembers: pipe(
          input.groupsMembers,
          O.getOrElse((): string[] => [])
        ),
        links: pipe(
          input.links,
          O.getOrElse((): string[] => [])
        ),
        keywords: pipe(
          input.keywords,
          O.getOrElse((): string[] => [])
        ),
        startDate: pipe(startDate, O.toUndefined),
        endDate: pipe(endDate, O.toUndefined),
        skip: findOptions.skip,
        take: findOptions.take,
      });

      return pipe(
        ctx.db.execSQL<any>(querySql),
        TE.map((results) => {
          ctx.logger.debug.log(
            `Science %O`,
            results.filter((r: any) => r.type === "study")
          );
          const totalEvents = pipe(
            results,
            A.findFirst((r: any) => r.type === "event"),
            O.map((d) => parseInt(d.total_count)),
            O.getOrElse(() => 0)
          );
          const totalDeaths = pipe(
            results,
            A.findFirst((r: any) => r.type === "death"),
            O.map((d) => parseInt(d.total_count)),
            O.getOrElse(() => 0)
          );
          const totalScientificStudies = pipe(
            results,
            A.findFirst((r: any) => r.type === "study"),
            O.map((d) => parseInt(d.total_count)),
            O.getOrElse(() => 0)
          );
          ctx.logger.debug.log(`Total %O`, {
            totalEvents,
            totalDeaths,
            totalScientificStudies,
          });
          const totals = {
            events: totalEvents,
            deaths: totalDeaths,
            scientificStudies: totalScientificStudies,
          };
          return [results, totals];
        })
      );
    };
    return pipe(
      ctx.db.find(GroupMemberEntity, {
        where: {
          "actor.id": In(
            pipe(
              actors,
              O.getOrElse((): string[] => [])
            )
          ),
        },
        relations: ["actor"],
      }),
      TE.chain((gm) =>
        sqlTask({
          ...queryRest,
          actors,
          groups,
          links,
          media,
          keywords,
          startDate,
          endDate,
          groupsMembers: pipe(
            query.groupsMembers,
            O.map((groupsMembers) => groupsMembers.concat(gm.map((g) => g.id)))
          ),
        })
      ),
      TE.chain(([events, totals]) =>
        pipe(
          events,
          A.traverse(E.Applicative)((e) =>
            E.right<ControllerError, SearchEvent>(toSearchEventIO(e))
          ),
          E.map((data) => ({ data, totals })),
          TE.fromEither
        )
      ),
      TE.map(({ data, totals }) => ({
        body: {
          data,
          totals,
        },
        statusCode: 200,
      }))
    );
  });
};
