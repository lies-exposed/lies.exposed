import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { SearchEvent } from "@econnessione/shared/io/http/Events";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { In } from "typeorm";
import { toSearchEventIO } from "./searchEvent.io";
import { searchEventSQL } from "./searchEvent.sql";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { ControllerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import { getORMOptions } from "@utils/listQueryToORMOptions";

interface inflateRelationsInput {
  actors: O.Option<string[]>;
  groups: O.Option<string[]>;
  groupsMembers: O.Option<string[]>;
}

const inflateRelations =
  (ctx: RouteContext) =>
  (
    input: inflateRelationsInput
  ): TE.TaskEither<
    ControllerError,
    { actors: string[]; groups: string[]; groupsMembers: string[] }
  > => {
    ctx.logger.info.log(`Inflate relations with %O`, input);
    /**
     * look for actors when
     */
    const actorsTask = O.isSome(input.groupsMembers)
      ? pipe(
          ctx.db.find(ActorEntity, {
            where: {
              "memberIn.id": In(input.groupsMembers.value),
            },
            relations: ["memberIn"],
          }),
          TE.map((aa) => aa.map((a) => a.id))
        )
      : TE.right(
          pipe(
            input.actors,
            O.getOrElse((): string[] => [])
          )
        );

    const groupsTask = TE.right<ControllerError, string[]>(
      pipe(
        input.groups,
        O.getOrElse((): string[] => [])
      )
    );

    // fetch groups members associated with the groups
    const groupsMembersTask = pipe(
      sequenceS(TE.ApplicativePar)({
        fromGroups: O.isSome(input.groups)
          ? pipe(
              ctx.db.find(GroupMemberEntity, {
                select: ["id", "group"],
                where: {
                  group: In(input.groups.value),
                },
              }),
              TE.map((gg) => gg.map((gg) => gg.id))
            )
          : TE.right([]),

        fromActors: O.isSome(input.actors)
          ? pipe(
              ctx.db.find(GroupMemberEntity, {
                select: ["id", "actor"],
                where: {
                  actor: In(input.actors.value),
                },
              }),
              ctx.logger.debug.logInTaskEither(`Gm from actors result %O`),
              TE.map((gg) => gg.map((g) => g.id))
            )
          : TE.right([]),
      }),
      TE.map(({ fromGroups, fromActors }) => {
        ctx.logger.debug.log(`groups members %O`, { fromGroups, fromActors });
        return fromGroups.concat(fromActors);
      })
    );
    return pipe(
      sequenceS(TE.ApplicativePar)({
        groupsMembers: groupsMembersTask,
        groups: groupsTask,
        actors: actorsTask,
      }),
      TE.map(({ actors, groups, groupsMembers }) => ({
        actors: actors,
        groupsMembers: groupsMembers,
        groups: groups,
      })),
      ctx.logger.debug.logInTaskEither(`Inflated input %O`)
    );
  };

const dbSearchTask =
  (ctx: RouteContext) =>
  (
    input: t.TypeOf<typeof Endpoints.Event.Custom.Search["Input"]["Query"]>,
    skip: number,
    take: number
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
      startDate: pipe(
        input.startDate,
        O.map((d) => new Date(d)),
        O.toUndefined
      ),
      endDate: pipe(input.endDate, O.toUndefined),
      skip,
      take,
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
      title,
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

    return pipe(
      inflateRelations(ctx)({
        actors,
        groups,
        groupsMembers,
      }),
      TE.chain(({ groups, actors, groupsMembers }) =>
        dbSearchTask(ctx)(
          {
            ...queryRest,
            actors: O.some(actors),
            groups: O.some(groups),
            groupsMembers: O.some(groupsMembers),
            title,
            links,
            media,
            keywords,
            startDate,
            endDate,
          },
          findOptions.skip,
          findOptions.take
        )
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
