import * as fs from "fs";
import * as path from "path";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { getOlderThanOr } from "@liexp/backend/lib/flows/fs/getOlderThanOr.flow.js";
import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { KeywordIO } from "@liexp/backend/lib/io/keyword.io.js";
import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { fetchRelations } from "@liexp/backend/lib/queries/common/fetchRelations.query.js";
import { infiniteSearchEventQuery } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  getColorByEventType,
  getTotals,
} from "@liexp/shared/lib/helpers/event/event.js";
import { toEventNetworkDatum } from "@liexp/shared/lib/helpers/event/eventNetworkDatum.helper.js";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations.js";
import { getTitleForSearchEvent } from "@liexp/shared/lib/helpers/event/getTitle.helper.js";
import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event.js";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  EventTotalsMonoid,
  type EventTotals,
} from "@liexp/shared/lib/io/http/Events/EventTotals.js";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/index.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword.js";
import {
  type EventNetworkDatum,
  type NetworkGraphOutput,
  type NetworkGroupBy,
  type NetworkLink,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import {
  type Actor,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http/index.js";
import { isNonEmpty } from "@liexp/shared/lib/utils/array.utils.js";
import * as O from "effect/Option";
import { type Monoid } from "fp-ts/Monoid";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type TEControllerError } from "../../types/TEControllerError.js";
import { type Flow, type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

interface GetEventGraphOpts {
  events: readonly SearchEvent.SearchEvent[];
  actors: readonly Actor.Actor[];
  groups: readonly Group.Group[];
  keywords: readonly Keyword.Keyword[];
  media: readonly Media.Media[];
  emptyRelations: boolean;
  relation: NetworkGroupBy;
}

const getEventGraph: Flow<[GetEventGraphOpts], NetworkGraphOutput> =
  ({
    events,
    actors: allActors,
    groups: allGroups,
    keywords: allKeywords,
    media: _allMedia,
    relation: _relation,
    emptyRelations,
  }) =>
  (_ctx) => {
    return pipe(
      events,
      fp.A.reduceWithIndex(initialResult, (index, acc, e) => {
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
          O.fromNullable,
          O.filter((aa) => (emptyRelations ? true : isNonEmpty(aa))),
          O.map((aa) =>
            allActors.filter((a) => aa.some((aa) => aa.id === a.id)),
          ),
          O.filter(isNonEmpty),
          O.map((aa) =>
            pipe(
              aa,
              fp.A.map((_a): NetworkLink[] => [
                // {
                //   source: a.id,
                //   target: e.id,
                //   fill: `#${a.color}`,
                //   stroke: `#${a.color}`,
                //   sourceType: ACTORS.value,
                //   value: 0,
                // },
              ]),
              fp.A.reduce(acc.actorLinks, (acc, i) => acc.concat(i)),
            ),
          ),
          O.getOrElse((): NetworkLink[] => acc.actorLinks),
        );

        const groupLinks = pipe(
          eventGroups,
          O.fromNullable,
          O.filter((gg) => (emptyRelations ? true : isNonEmpty(gg))),
          O.map((gg) =>
            allGroups.filter((a) => gg.some((aa) => aa.id === a.id)),
          ),
          O.filter(isNonEmpty),
          O.map((aa) =>
            pipe(
              aa,
              fp.A.map((_a): NetworkLink[] => [
                // {
                //   source: a.id,
                //   target: e.id,
                //   fill: `#${a.color}`,
                //   stroke: `#${a.color}`,
                //   sourceType: GROUPS.value,
                //   value: 0,
                // },
              ]),
              fp.A.reduce(acc.groupLinks, (acc, i) => acc.concat(i)),
            ),
          ),
          O.getOrElse((): NetworkLink[] => acc.groupLinks),
        );

        const keywordLinks = pipe(
          eventKeywords,
          O.fromNullable,
          O.filter((gg) => (emptyRelations ? true : isNonEmpty(gg))),
          O.map((gg) =>
            allKeywords.filter((a) => gg.some((aa) => aa.id === a.id)),
          ),
          O.filter(isNonEmpty),
          O.map((aa) =>
            pipe(
              aa,
              fp.A.map((_a): NetworkLink[] => [
                // {
                //   source: a.id,
                //   target: e.id,
                //   fill: `#${a.color}`,
                //   stroke: `#${a.color}`,
                //   sourceType: KEYWORDS.value,
                //   value: 0,
                // },
              ]),
              fp.A.reduce(acc.keywordLinks, (acc, i) => acc.concat(i)),
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
            image: featuredImage,
            title: eventTitle,
            date: e.date,
            selected: true,
            innerColor: getColorByEventType({
              type: e.type,
            }),
            outerColor: getColorByEventType({
              type: e.type,
            }),
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
          events: [...acc.events, toEventNetworkDatum(e)],
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
          fp.A.foldMap({
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
          eventNodes,
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

const reduceResultToOutput: Flow<
  [readonly NetworkGraphOutput[]],
  NetworkGraphOutput
> = (results) => (_ctx) => {
  return pipe(results, fp.A.reduce(initialOutput, monoidOutput.concat));
};

interface Result {
  events: EventNetworkDatum[];
  eventNodes: EventNetworkDatum[];
  eventLinks: NetworkLink[];
  selectedLinks: [];
  actorLinks: NetworkLink[];
  groupLinks: NetworkLink[];
  keywordLinks: NetworkLink[];
  totals: EventTotals;
}

const initialResult: Result = {
  events: [],
  eventNodes: [],
  eventLinks: [],
  selectedLinks: [],
  actorLinks: [],
  groupLinks: [],
  keywordLinks: [],
  totals: EventTotalsMonoid.empty,
};

export const createEventNetworkGraph =
  (id: UUID, isAdmin: boolean): TEReader<NetworkGraphOutput> =>
  (ctx) => {
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
      TE.chainEitherK((ev) => EventV2IO.decodeSingle({ ...ev, links: [] })),
      LoggerService.TE.debug(ctx, [`event %O`]),
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
          fetchRelations(
            {
              keywords: pipe(
                keywords,

                O.fromNullable,
                O.filter(isNonEmpty),
              ),
              actors: pipe(
                actors,

                O.fromNullable,
                O.filter(isNonEmpty),
              ),
              groups: pipe(groups, O.fromNullable, O.filter(isNonEmpty)),
              groupsMembers: O.some(groupsMembers),
              links: O.none(),
              media: pipe(
                media,

                O.fromNullable,
                O.filter(isNonEmpty),
              ),
            },
            isAdmin,
          )(ctx),
          TE.map((relations) => ({ event, relations })),
        );
      }),
      TE.chain(({ event, relations }) =>
        sequenceS(TE.ApplicativePar)({
          event: TE.right(event),
          actors: pipe(ActorIO.decodeMany(relations.actors), fp.TE.fromEither),
          groups: pipe(
            relations.groups.map((g) => ({ ...g, members: [] })),
            (groups) => GroupIO.decodeMany(groups),
            fp.TE.fromEither,
          ),
          keywords: pipe(
            relations.keywords,
            KeywordIO.decodeMany,
            fp.TE.fromEither,
          ),
          media: pipe(
            relations.media.map((m) => ({
              ...m,
              links: [],
              keywords: [],
              events: [],
            })),
            (mm) => MediaIO.decodeMany(mm),
            fp.TE.fromEither,
          ),
        }),
      ),
      TE.chain(({ event, actors, groups, keywords, media }) => {
        ctx.logger.debug.log(`Actors %d: %O`, actors.length);
        ctx.logger.debug.log(`Groups %d`, groups.length);
        ctx.logger.debug.log(`Keywords %d`, keywords.length);
        ctx.logger.debug.log(`Media %d`, media.length);

        const searchEvent = toSearchEvent(event, {
          actors,
          groups,
          keywords,
          media,
          groupsMembers: [],
        });

        const getGraph = (
          ids: UUID[],
          key: "keywords" | "actors" | "groups",
        ): TEControllerError<NetworkGraphOutput> =>
          pipe(
            ids,
            fp.A.traverse(TE.ApplicativeSeq)((k) =>
              pipe(
                infiniteSearchEventQuery({
                  exclude: O.some([event.id]),
                  [key]: O.some([k]),
                  order: { date: "DESC" },
                })(ctx),
                fp.TE.chainEitherK((evs) =>
                  EventV2IO.decodeMany(evs.map((ev) => ({ ...ev, links: [] }))),
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
                        actors,
                        groups,
                        keywords,
                        media,
                        groupsMembers: [],
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
                      getEventGraph({
                        events,
                        keywords,
                        actors,
                        groups,
                        media,
                        relation: key,
                        emptyRelations: false,
                      })(ctx),
                  ),
                ]),
                fp.TE.map((tuples) => {
                  const color = getColorByEventType({
                    type: event.type,
                  });
                  const update: any = {};
                  ctx.logger.debug.log("Source key %s", k);
                  if (key === ACTORS.literals[0]) {
                    update.actorLinks = [
                      {
                        source: k,
                        sourceType: key,
                        target: event.id,
                        fill: color,
                        stroke: color,
                        value: 0,
                      },
                    ];
                    if (tuples[1].events?.[0]?.id) {
                      update.actorLinks.push({
                        source: tuples[1].events?.[0]?.id,
                        sourceType: "events",
                        target: k + "",
                        fill: color,
                        stroke: color,
                        value: 0,
                      });
                    }

                    update.actorLinks.push(...tuples[1].actorLinks);
                  }

                  if (key === GROUPS.literals[0]) {
                    update.groupLinks = [
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
                      update.groupLinks.push({
                        source: tuples[1].events?.[0]?.id,
                        sourceType: "events",
                        target: k.toString(),
                        fill: color,
                        stroke: color,
                        value: 0,
                      });
                    }
                    update.groupLinks.push(...tuples[1].groupLinks);
                  }

                  if (key === KEYWORDS.literals[0]) {
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
                        sourceType: "events" as const,
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
            TE.map((results) => reduceResultToOutput(results)(ctx)),
            TE.map((output) => ({
              ...output,
              actors,
              groups,
              keywords,
              events: [toEventNetworkDatum(searchEvent)].concat(output.events),
            })),
          );

        return pipe(
          sequenceS(TE.ApplicativePar)({
            keywords: getGraph(
              keywords.map((k) => k.id),
              KEYWORDS.literals[0],
            ),
            actors: getGraph(
              actors.map((a) => a.id),
              ACTORS.literals[0],
            ),
            groups: getGraph(
              groups.map((g) => g.id),
              GROUPS.literals[0],
            ),
          }),
          TE.map(({ keywords, groups, actors }) =>
            reduceResultToOutput([keywords, groups, actors])(ctx),
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

    return pipe(
      getOlderThanOr(filePath, 6)(() => createEventNetworkGraphTask)(ctx),
    );
  };
