import * as fs from "fs";
import path from "path";
import { fp } from "@liexp/core/lib/fp";
import { TupleWithId } from "@liexp/core/lib/fp/utils/TupleWithId";
import {
  getColorByEventType,
  getTotals,
} from "@liexp/shared/lib/helpers/event/event";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds";
import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations";
import { getTitleForSearchEvent } from "@liexp/shared/lib/helpers/event/getTitle.helper";
import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event";
import {
  type Actor,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events";
import {
  EventTotalsMonoid,
  type EventTotals,
} from "@liexp/shared/lib/io/http/Events/EventTotals";
import { GROUPS } from "@liexp/shared/lib/io/http/Group";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword";
import {
  type NetworkGraphOutput,
  type NetworkGroupBy,
  type NetworkLink,
} from "@liexp/shared/lib/io/http/Network";
import { type EventNetworkDatum } from "@liexp/shared/lib/io/http/Network/networks";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import { type Monoid } from "fp-ts/Monoid";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type UUID } from "io-ts-types/lib/UUID";
import { Equal } from "typeorm";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type Flow, type TEFlow } from "@flows/flow.types";
import { toControllerError, type ControllerError } from "@io/ControllerError";
import { toActorIO } from "@routes/actors/actor.io";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { fetchRelations } from "@routes/events/queries/fetchEventRelations.query";
import { infiniteSearchEventQuery } from "@routes/events/queries/searchEventsV2.query";
import { toGroupIO } from "@routes/groups/group.io";
import { toKeywordIO } from "@routes/keywords/keyword.io";
import { toMediaIO } from "@routes/media/media.io";

interface GetEventGraphOpts {
  events: SearchEvent.SearchEvent[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  media: Media.Media[];
  emptyRelations: boolean;
  relation: NetworkGroupBy;
}

const getEventGraph: Flow<[GetEventGraphOpts], NetworkGraphOutput> =
  (ctx) =>
  ({
    events,
    actors: allActors,
    groups: allGroups,
    keywords: allKeywords,
    media: allMedia,
    relation,
    emptyRelations,
  }) => {
    return pipe(
      events,
      A.reduceWithIndex(initialResult, (index, acc, e) => {
        // get topic from relative directory

        const {
          actors: eventActors,
          groups: eventGroups,
          keywords: eventKeywords,
          media: eventMedia,
        } = getSearchEventRelations(e);

        const eventTitle = getTitleForSearchEvent(e);

        const actorLinks = pipe(
          eventActors,
          O.fromPredicate((aa) => (emptyRelations ? true : aa.length > 0)),
          O.map((aa) =>
            allActors.filter((a) => aa.some((aa) => aa.id === a.id)),
          ),
          O.filter(A.isNonEmpty),
          O.map((aa) =>
            pipe(
              aa,
              A.map((a): NetworkLink[] => [
                // {
                //   source: a.id,
                //   target: e.id,
                //   fill: `#${a.color}`,
                //   stroke: `#${a.color}`,
                //   sourceType: ACTORS.value,
                //   value: 0,
                // },
              ]),
              A.reduce(acc.actorLinks, (acc, i) => acc.concat(i)),
            ),
          ),
          O.getOrElse((): NetworkLink[] => acc.actorLinks),
        );

        const groupLinks = pipe(
          eventGroups,
          O.fromPredicate((gg) => (emptyRelations ? true : gg.length > 0)),
          O.map((gg) =>
            allGroups.filter((a) => gg.some((aa) => aa.id === a.id)),
          ),
          O.filter(A.isNonEmpty),
          O.map((aa) =>
            pipe(
              aa,
              A.map((a): NetworkLink[] => [
                // {
                //   source: a.id,
                //   target: e.id,
                //   fill: `#${a.color}`,
                //   stroke: `#${a.color}`,
                //   sourceType: GROUPS.value,
                //   value: 0,
                // },
              ]),
              A.reduce(acc.groupLinks, (acc, i) => acc.concat(i)),
            ),
          ),
          O.getOrElse((): NetworkLink[] => acc.groupLinks),
        );

        const keywordLinks = pipe(
          eventKeywords,
          O.fromPredicate((gg) => (emptyRelations ? true : gg.length > 0)),
          O.map((gg) =>
            allKeywords.filter((a) => gg.some((aa) => aa.id === a.id)),
          ),
          O.filter(A.isNonEmpty),
          O.map((aa) =>
            pipe(
              aa,
              A.map((a): NetworkLink[] => [
                // {
                //   source: a.id,
                //   target: e.id,
                //   fill: `#${a.color}`,
                //   stroke: `#${a.color}`,
                //   sourceType: KEYWORDS.value,
                //   value: 0,
                // },
              ]),
              A.reduce(acc.keywordLinks, (acc, i) => acc.concat(i)),
            ),
          ),
          O.getOrElse((): NetworkLink[] => acc.keywordLinks),
        );

        // console.log({ filteredEventActors, filteredEventGroups });

        const featuredImage = pipe(
          eventMedia,
          fp.A.map((m) => m?.thumbnail),
          fp.A.filter((m) => m !== undefined),
          fp.A.head,
          fp.O.toUndefined,
        );
        const eventNodes: EventNetworkDatum[] = [
          {
            ...e,
            links: [],
            excerpt: {},
            body: {},
            payload: e.payload as any,
            deletedAt: undefined,
            image: featuredImage,
            title: eventTitle,
            selected: true,
            date: e.date,
            groupBy: [],
            actors: [],
            groups: [],
            label: eventTitle,
          },
        ];

        let evLinks: NetworkLink[] = [];
        if (index > 0) {
          const sourceEv = acc.eventNodes[index - 1];
          evLinks = [
            {
              source: sourceEv.id,
              target: e.id,

              sourceType: "events",
              stroke: getColorByEventType({
                type: sourceEv.type,
              }),
              fill: getColorByEventType({
                type: sourceEv.type,
              }),
              value: 0.5,
            },
          ];
        }

        const evNodes = [...acc.eventNodes, ...eventNodes];

        return {
          eventNodes: evNodes,
          eventLinks: [...acc.eventLinks, ...evLinks],
          actorLinks,
          groupLinks,
          keywordLinks,
          selectedLinks: acc.selectedLinks,
          totals: getTotals(acc.totals, e),
        };
      }),
      ({ eventNodes, ...r }) => {
        const dateRange = pipe(
          eventNodes,
          A.foldMap({
            empty: {
              startDate: new Date(),
              endDate: new Date(),
            },
            concat: (x, y) => ({
              startDate: new Date(
                Math.min(x.startDate.getTime(), y.startDate.getTime()),
              ),
              endDate: new Date(
                Math.max(x.endDate.getTime(), y.endDate.getTime()),
              ),
            }),
          })((f) => ({
            startDate: f.date,
            endDate: f.date,
          })),
        );

        return {
          ...r,
          ...dateRange,
          media: [],
          selectedLinks: [],
          events: eventNodes,
          actors: allActors,
          groups: allGroups,
          keywords: allKeywords,
        };
      },
    );
  };

const initialOutput: NetworkGraphOutput = {
  events: [],
  eventLinks: [],
  actorLinks: [],
  actors: [],
  groupLinks: [],
  groups: [],
  keywordLinks: [],
  keywords: [],
  media: [],
  selectedLinks: [],
  startDate: new Date(),
  endDate: new Date(),
  totals: EventTotalsMonoid.empty,
};

const monoidOutput: Monoid<NetworkGraphOutput> = {
  empty: initialOutput,
  concat: (x, y) => ({
    ...x,
    keywords: x.keywords.concat(
      y.keywords.filter((a) => !x.keywords.some((aa) => aa.id === a.id)),
    ),
    actors: x.actors.concat(
      y.actors.filter((a) => !x.actors.some((aa) => aa.id === a.id)),
    ),
    groups: x.groups.concat(
      y.groups.filter((a) => !x.groups.some((aa) => aa.id === a.id)),
    ),
    events: x.events.concat(
      y.events.filter((e) => !x.events.some((ee) => ee.id === e.id)),
    ),
    selectedLinks: x.selectedLinks.concat(y.selectedLinks),
    actorLinks: x.actorLinks.concat(y.actorLinks),
    keywordLinks: x.keywordLinks.concat(y.keywordLinks),
    groupLinks: x.groupLinks.concat(y.groupLinks),
    eventLinks: x.eventLinks.concat(y.eventLinks),
    totals: EventTotalsMonoid.concat(x.totals, y.totals),
  }),
};

const reduceResultToOutput: Flow<[NetworkGraphOutput[]], NetworkGraphOutput> =
  (ctx) => (results) => {
    return pipe(results, A.reduce(initialOutput, monoidOutput.concat));
  };

interface Result {
  eventNodes: EventNetworkDatum[];
  eventLinks: NetworkLink[];
  selectedLinks: [];
  actorLinks: NetworkLink[];
  groupLinks: NetworkLink[];
  keywordLinks: NetworkLink[];
  totals: EventTotals;
}

const initialResult: Result = {
  eventNodes: [],
  eventLinks: [],
  selectedLinks: [],
  actorLinks: [],
  groupLinks: [],
  keywordLinks: [],
  totals: EventTotalsMonoid.empty,
};

export const createEventNetworkGraph: TEFlow<
  [UUID, boolean],
  NetworkGraphOutput
> = (ctx) => (id, isAdmin) => {
  const filePath = path.resolve(
    ctx.config.dirs.temp.root,
    `networks/events/${id}.json`,
  );

  const createEventNetworkGraphTask = pipe(
    ctx.db.findOneOrFail(EventV2Entity, {
      where: {
        id: Equal(id),
      },
      loadRelationIds: {
        relations: ["keywords", "media"],
      },
    }),
    TE.chainEitherK((ev) => toEventV2IO({ ...ev, links: [] })),
    ctx.logger.debug.logInTaskEither(`event %O`),
    // get all relations for the given event
    fp.TE.map((event) => ({
      ...getRelationIds(event),
      event,
    })),
    // get event timeline for each relation
    TE.chain(({ actors, groups, keywords, groupsMembers, media, event }) => {
      ctx.logger.debug.log("Relation graph for this event %O", {
        actors: actors.length,
        groups: groups.length,
        keywords: keywords.length,
      });

      return pipe(
        fetchRelations(ctx)(
          {
            keywords: pipe(
              keywords,
              O.fromPredicate((a) => a.length > 0),
            ),
            actors: pipe(
              actors,
              O.fromPredicate((a) => a.length > 0),
            ),
            groups: pipe(
              groups,
              O.fromPredicate((g) => g.length > 0),
            ),
            groupsMembers: O.some(groupsMembers),
            links: O.none,
            media: pipe(
              media,
              O.fromPredicate((m) => m.length > 0),
            ),
          },
          isAdmin,
        ),
        TE.map((r) => ({ event, ...r })),
      );
    }),
    TE.chain(({ event, ...relations }) =>
      sequenceS(TE.ApplicativePar)({
        event: fp.TE.right(event),
        actors: pipe(
          relations.actors,
          fp.A.traverse(fp.E.Applicative)(toActorIO),
          fp.TE.fromEither,
        ),
        groups: pipe(
          relations.groups,
          fp.A.traverse(fp.E.Applicative)((g) =>
            toGroupIO({ ...g, members: [] }),
          ),
          fp.TE.fromEither,
        ),
        keywords: pipe(
          relations.keywords,
          fp.A.traverse(fp.E.Applicative)(toKeywordIO),
          fp.TE.fromEither,
        ),
        media: pipe(
          relations.media,
          fp.A.traverse(fp.E.Applicative)((m) =>
            toMediaIO(
              {
                ...m,
                links: [],
                keywords: [],
                events: [],
              },
              ctx.env.SPACE_ENDPOINT,
            ),
          ),
          fp.TE.fromEither,
        ),
      }),
    ),
    TE.chain(({ event, actors, groups, keywords, media }) => {
      ctx.logger.debug.log(`Actors %d`, actors.length);
      ctx.logger.debug.log(`Groups %d`, groups.length);
      ctx.logger.debug.log(`Keywords %d`, keywords.length);
      ctx.logger.debug.log(`Media %d`, media.length);

      const getGraph = (
        ids: UUID[],
        key: "keywords" | "actors" | "groups",
      ): TE.TaskEither<ControllerError, NetworkGraphOutput> =>
        pipe(
          ids,
          A.traverse(TE.ApplicativeSeq)((k) =>
            pipe(
              infiniteSearchEventQuery(ctx)({
                exclude: O.some([event.id]),
                [key]: O.some([k]),
                order: { date: "DESC" },
              }),
              fp.TE.chainEitherK(
                fp.A.traverse(fp.E.Applicative)((ev) =>
                  toEventV2IO({ ...ev, links: [] }),
                ),
              ),
              fp.TE.map((ee): [string, NetworkGraphOutput] => [
                k,
                pipe(
                  ee,
                  // (ee) => {
                  //   ctx.logger.debug.log(
                  //     `Deaths events %O`,
                  //     ee.filter((e) => e.type === "Death")
                  //   );
                  //   return ee;
                  // },
                  fp.A.map((e) =>
                    toSearchEvent(e, {
                      actors: new Map(actors.map(TupleWithId.of)),
                      groups: new Map(groups.map(TupleWithId.of)),
                      keywords: new Map(keywords.map(TupleWithId.of)),
                      media: new Map(media.map(TupleWithId.of)),
                      groupsMembers: new Map(),
                    }),
                  ),
                  // (events) => {
                  //   ctx.logger.debug.log(
                  //     "Deaths %O",
                  //     events.filter((e) => e.type === "Death")
                  //   );
                  //   return events;
                  // },
                  (events) =>
                    getEventGraph(ctx)({
                      events,
                      keywords,
                      actors,
                      groups,
                      media,
                      relation: key,
                      emptyRelations: false,
                    }),
                ),
              ]),
              fp.TE.map((tuples) => {
                const color = getColorByEventType({
                  type: event.type,
                });
                const update: any = {};

                if (key === ACTORS.value) {
                  update.actorLinks = [
                    {
                      source: k + "",
                      sourceType: key,
                      target: event.id + "",
                      fill: color,
                      stroke: color,
                      value: 0,
                    },
                    {
                      source: tuples[1].events?.[0]?.id + "",
                      sourceType: "events",
                      target: k + "",
                      fill: color,
                      stroke: color,
                      value: 0,
                    },
                  ].concat(tuples[1].actorLinks);
                }

                if (key === GROUPS.value) {
                  update.groupLinks = [
                    {
                      source: k.toString(),
                      sourceType: key,
                      target: event.id.toString(),
                      fill: color,
                      stroke: color,
                      value: 0,
                    },
                    {
                      source: tuples[1].events?.[0]?.id,
                      sourceType: "events",
                      target: k.toString(),
                      fill: color,
                      stroke: color,
                      value: 0,
                    },
                  ].concat(tuples[1].groupLinks);
                }

                if (key === KEYWORDS.value) {
                  update.keywordLinks = [
                    {
                      source: k.toString(),
                      sourceType: key,
                      target: event.id.toString(),
                      fill: color,
                      stroke: color,
                      value: 0,
                    },
                  ];
                  if (tuples[1].events?.[0]?.id) {
                    update.keywordLinks.push({
                      source: tuples[1].events?.[0]?.id,
                      sourceType: "events" as any,
                      target: k.toString(),
                      fill: color,
                      stroke: color,
                      value: 0,
                    });
                  }

                  update.keywordLinks.push(...tuples[1].keywordLinks);
                }

                return {
                  ...tuples[1],
                  ...update,
                };
              }),
            ),
          ),
          TE.map(reduceResultToOutput(ctx)),
          TE.map((output) => ({
            ...output,
            actors,
            groups,
            keywords,
            events: [event].concat(output.events),
          })),
        );

      return pipe(
        sequenceS(TE.ApplicativePar)({
          keywords: getGraph(
            keywords.map((k) => k.id),
            KEYWORDS.value,
          ),
          actors: getGraph(
            actors.map((a) => a.id),
            ACTORS.value,
          ),
          groups: getGraph(
            groups.map((g) => g.id),
            GROUPS.value,
          ),
        }),
        TE.map(({ keywords, groups, actors }) =>
          reduceResultToOutput(ctx)([keywords, groups, actors]),
        ),
      );
    }),
    TE.chainIOEitherK((graph) => {
      return fp.IOE.tryCatch(() => {
        fs.writeFileSync(filePath, JSON.stringify(graph));
        return graph;
      }, toControllerError);
    }),
  );

  return pipe(createEventNetworkGraphTask, ctx.fs.getOlderThanOr(filePath, 6));
};
