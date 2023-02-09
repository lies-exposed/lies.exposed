import * as fs from "fs";
import path from "path";
import { isDate } from "util/types";
import { fp } from "@liexp/core/fp";
import {
  eqByUUID,
  type EventRelationIds,
  getEventsMetadata,
  getRelationIds,
} from "@liexp/shared/helpers/event/event";
import { getTitleForSearchEvent } from "@liexp/shared/helpers/event/getTitle.helper";
import { toSearchEvent } from "@liexp/shared/helpers/event/search-event";
import {
  Events,
  type Media,
  type Actor,
  type Common,
  type Group,
  type Keyword,
} from "@liexp/shared/io/http";
import { ACTORS } from "@liexp/shared/io/http/Actor";
import { type Event, type SearchEvent } from "@liexp/shared/io/http/Events";
import { GROUPS } from "@liexp/shared/io/http/Group";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import { ValidContentType } from "@liexp/shared/io/http/Media";
import {
  type GetNetworkQuery,
  type NetworkGroupBy,
  type NetworkType,
} from "@liexp/shared/io/http/Network";
import { type EventNetworkDatum } from "@liexp/shared/io/http/Network/networks";
import { distanceFromNow, parseISO } from "@liexp/shared/utils/date";
import { walkPaginatedRequest } from "@liexp/shared/utils/fp.utils";
import { differenceInHours, differenceInDays } from "date-fns";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { sequenceS } from "fp-ts/lib/Apply";
import { type NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/string";
import { type UUID } from "io-ts-types/lib/UUID";
import { type ControllerError, toControllerError } from "@io/ControllerError";
import { toActorIO } from "@routes/actors/actor.io";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { fetchRelations } from "@routes/events/queries/fetchEventRelations.utils";
import { searchEventV2Query } from "@routes/events/queries/searchEventsV2.query";
import { toGroupIO } from "@routes/groups/group.io";
import { toKeywordIO } from "@routes/keywords/keyword.io";
import { toImageIO } from "@routes/media/media.io";
import { type RouteContext } from "@routes/route.types";

interface NetworkLink {
  source: UUID;
  target: UUID;
  fill: string;
  value: number;
  stroke: string;
  sourceType: NetworkType;
}

const updateMap =
  <F extends Common.BaseProps>(acc: Map<string, F>) =>
  (items: F[]): Map<string, F> => {
    return pipe(
      items,
      A.reduce(acc, (r, t) => {
        if (fp.Map.elem(eqByUUID)(t, r)) {
          return r;
        }
        return fp.Map.upsertAt(S.Eq)(t.id, t)(r);
      })
    );
  };

const getLinks =
  (
    nodes: EventNetworkDatum[],
    relationLinks: Map<string, NetworkLink[]>,
    relationType: NetworkType,
    type: NetworkType,
    id: UUID
  ) =>
  (
    relations: Array<Common.BaseProps & { color: string }>
  ): Map<string, NetworkLink[]> => {
    return pipe(
      nodes,
      A.reduce(relationLinks, (acc, p) => {
        const newLinks = pipe(
          relations,
          A.reduce(acc, (acc1, relation) => {
            const eventLinks: NetworkLink[] = [
              // {
              //   source: relation.id,
              //   sourceType: relationType,
              //   target: id,
              //   value: 1,
              //   stroke: `#${relation.color}`,
              //   fill: `#${relation.color}`,
              // },
              {
                source: p.id,
                sourceType: "events" as any,
                target: relation.id,
                stroke: `#${relation.color}`,
                fill: `#${relation.color}`,
                value: 1,
              },
            ];

            return pipe(acc1, fp.Map.upsertAt(S.Eq)(relation.id, eventLinks));
          })
        );

        return newLinks;
      })
    );
  };

const takeEventRelations = (ev: Event[]): EventRelationIds => {
  return pipe(
    ev.reduce(
      (acc: EventRelationIds, e) => {
        const { actors, keywords, groups, groupsMembers, media } =
          getRelationIds(e);
        return {
          keywords: acc.keywords.concat(
            keywords.filter((k) => !acc.keywords.includes(k))
          ),
          actors: acc.actors.concat(
            actors.filter((a) => !acc.actors.includes(a))
          ),
          groups: acc.groups.concat(
            groups.filter((g) => !acc.groups.includes(g))
          ),
          groupsMembers: acc.groupsMembers.concat(groupsMembers),
          media: acc.media.concat(media),
          links: [],
        };
      },
      {
        keywords: [],
        groups: [],
        actors: [],
        groupsMembers: [],
        media: [],
        links: [],
      }
    )
  );
};

interface GetEventGraphOpts {
  events: SearchEvent.SearchEvent[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  media: Media.Media[]
  emptyRelations: boolean;
  relation: NetworkGroupBy;
  groupBy: NetworkGroupBy;
}

const getEventGraph =
  (ctx: RouteContext) =>
  (
    type: NetworkType,
    id: UUID,
    {
      events,
      actors: allActors,
      groups: allGroups,
      keywords: allKeywords,
      media: allMedia,
      relation,
      emptyRelations,
      groupBy,
    }: GetEventGraphOpts
  ): Result => {
    return pipe(
      events,
      A.reduce(initialResult, (acc, e) => {
        // get topic from relative directory

        const {
          actors: eventActors,
          groups: eventGroups,
          keywords: eventKeywords,
          media: eventMedia,
        } = getEventsMetadata(e);

        const eventTitle = getTitleForSearchEvent(e);

        const nonEmptyEventActors = pipe(
          eventActors,
          O.fromPredicate((aa) => (emptyRelations ? true : aa.length > 0)),
          O.map((aa) =>
            allActors.filter((a) => aa.some((aa) => aa.id === a.id))
          ),
          O.filter(A.isNonEmpty)
        );

        const nonEmptyEventGroups = pipe(
          eventGroups,
          O.fromPredicate((gg) => (emptyRelations ? true : gg.length > 0)),
          O.map((gg) =>
            allGroups.filter((a) => gg.some((aa) => aa.id === a.id))
          ),
          O.filter(A.isNonEmpty)
        );

        const nonEmptyEventKeywords = pipe(
          eventKeywords,
          O.fromPredicate((gg) => (emptyRelations ? true : gg.length > 0)),
          O.map((gg) =>
            allKeywords.filter((a) => gg.some((aa) => aa.id === a.id))
          ),
          O.filter(A.isNonEmpty)
        );

        // console.log({ filteredEventActors, filteredEventGroups });

        const groupByEventList: O.Option<
          NonEmptyArray<Keyword.Keyword | Group.Group | Actor.Actor>
        > =
          groupBy === GROUPS.value
            ? nonEmptyEventGroups
            : groupBy === ACTORS.value
            ? nonEmptyEventActors
            : nonEmptyEventKeywords;

        // ctx.logger.debug.log("Group by item list %O", groupByEventList);

        const groupByItem = pipe(
          groupByEventList,
          O.map((d) => d.find((d) => d.id === id)),
          O.toUndefined
        );

        const relationByEventList: O.Option<
          NonEmptyArray<Keyword.Keyword | Group.Group | Actor.Actor>
        > =
          relation === GROUPS.value
            ? nonEmptyEventGroups
            : relation === ACTORS.value
            ? nonEmptyEventActors
            : nonEmptyEventKeywords;

        const featuredImage = pipe(
          eventMedia,
          fp.A.filter((m) => ValidContentType.is(m.type)),
          fp.O.fromPredicate((mm) => mm.length > 0),
          fp.O.map((mm) => mm[0].location),
          fp.O.toUndefined
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
            selected: !!groupByItem,
            date: e.date,
            groupBy: groupByItem ? [groupByItem] : [],
            actors: [],
            groups: [],
            label: eventTitle,
          },
        ];

        // console.log(
        //   "event actors",
        //   eventActors
        // );

        const actors = pipe(
          nonEmptyEventActors,
          O.getOrElse((): Actor.Actor[] => []),
          updateMap(acc.actors)
        );

        // console.log("actors", actors);

        const groups = pipe(
          nonEmptyEventGroups,
          O.getOrElse((): Group.Group[] => []),
          updateMap(acc.groups)
        );

        // console.log("groups", groups);

        // console.log("event keywords", nonEmptyEventKeywords);

        const keywords = pipe(
          nonEmptyEventKeywords,
          O.getOrElse((): Keyword.Keyword[] => []),
          updateMap(acc.keywords)
        );

        // console.log("keywords", keywords);

        // const groupByItems = updateMap(acc.groupByItems)(groupByEventList);

        // const groupByLinks = pipe(groupByEventList, (items: GroupByItem[]) => {
        //   const emptyMap: Map<string, NetworkLink[]> = Map.empty;
        //   return pipe(
        //     items.map((item) =>
        //       getLinks, type, id(
        //         eventNodes.filter(
        //           (e) =>
        //             e.data.groupBy.findIndex((tt) => tt.id === item.id) === 0
        //         ),
        //         acc.groupByLinks
        //       )([])
        //     ),
        //     A.reduce(emptyMap, (mm, m) => {
        //       return pipe(
        //         m,
        //         Map.keys(Ord.ordString),
        //         A.reduce(mm, (acc, key) => {
        //           return pipe(
        //             Map.lookup(Eq.eqString)(key, m),
        //             O.map((mapLinks) =>
        //               pipe(
        //                 Map.lookup(Eq.eqString)(key, acc),
        //                 O.map((accLinks) => [...accLinks, ...mapLinks]),
        //                 O.getOrElse(() => mapLinks),
        //                 (links) => Map.insertAt(Eq.eqString)(key, links)(acc)
        //               )
        //             ),
        //             O.getOrElse((): Map<string, NetworkLink[]> => acc)
        //           );
        //         })
        //       );
        //     })
        //   );
        // });

        // console.log('actor links in acc', acc.actorLinks);
        const actorLinks: any = pipe(
          nonEmptyEventActors,
          O.getOrElse((): Actor.Actor[] => []),
          getLinks(eventNodes, acc.actorLinks, ACTORS.value, type, id)
        );

        // console.log('actor links', actorLinks);

        const groupLinks = pipe(
          nonEmptyEventGroups,
          O.getOrElse((): Group.Group[] => []),
          getLinks(eventNodes, acc.groupLinks, GROUPS.value, type, id)
        );

        const keywordLinks = pipe(
          nonEmptyEventKeywords,
          O.getOrElse((): Keyword.Keyword[] => []),
          getLinks(eventNodes, acc.keywordLinks, KEYWORDS.value, type, id)
        );

        const relationLinks = pipe(
          relationByEventList,
          O.map((arr) =>
            pipe(
              arr,
              A.reduce([] as NetworkLink[], (linkAcc, item) => {
                const sourceLinkIndex = acc.eventLinks.findIndex(
                  (l) => l.source === id && l.target === item.id
                );

                if (sourceLinkIndex > -1) {
                  acc.eventLinks[sourceLinkIndex] = {
                    ...acc.eventLinks[sourceLinkIndex],
                    value: acc.eventLinks[sourceLinkIndex].value + 1,
                  };
                }
                // } else {
                //   linkAcc.push({
                //     source: id,
                //     sourceType: relation,
                //     target: item.id,
                //     fill: `#${item.color}`,
                //     stroke: `#${item.color}`,
                //     value: 1,
                //   });
                // }

                return linkAcc.concat(
                  ...[
                    {
                      source: item.id,
                      sourceType: relation,
                      target: e.id,
                      fill: `#${item.color}`,
                      stroke: `#${item.color}`,
                      value: 1,
                    },
                  ]
                );
              })
            )
          ),
          O.getOrElse((): NetworkLink[] => [])
        );

        const groupByLinks = pipe(
          groupByEventList,
          O.map((arr) =>
            pipe(
              arr,
              A.reduce([] as NetworkLink[], (linkAcc, item) => {
                const sourceLinkIndex = acc.eventLinks.findIndex(
                  (l) => l.source === id && l.target === item.id
                );

                if (sourceLinkIndex > -1) {
                  acc.eventLinks[sourceLinkIndex] = {
                    ...acc.eventLinks[sourceLinkIndex],
                    value:
                      (acc.eventLinks[sourceLinkIndex].value + 1) /
                      acc.eventLinks[sourceLinkIndex].value,
                  };
                } else {
                  linkAcc.push({
                    source: id,
                    sourceType: type,
                    target: item.id,
                    fill: `#${item.color}`,
                    stroke: `#${item.color}`,
                    value: 1,
                  });
                }

                if (arr.length > 1) {
                  if (id === item.id) {
                    return linkAcc;
                  }
                }

                return linkAcc.concat(
                  ...[
                    {
                      source: e.id,
                      sourceType: "events" as any,
                      target: item.id,
                      fill: `#${item.color}`,
                      stroke: `#${item.color}`,
                      value: 1,
                    },
                  ]
                );
              })
            )
          ),
          O.getOrElse((): NetworkLink[] => [])
        );

        // ctx.logger.debug.log("Event links %O", links);

        // const eventNodesToAdd = eventNodes;

        const evNodes: any[] = [...acc.eventNodes, ...eventNodes];

        return {
          eventNodes: evNodes,
          eventLinks: [...acc.eventLinks, ...groupByLinks, ...relationLinks],
          actors,
          actorLinks,
          groups,
          groupLinks,
          keywords,
          keywordLinks,
          selectedEvents: [...acc.selectedEvents, e.id],
        };
      })
    );
  };

const makeGraph =
  (ctx: RouteContext) =>
  (
    type: NetworkType,
    id: UUID,
    groupBy: NetworkGroupBy,
    relation: NetworkGroupBy,
    eventGraph: Result
  ): NetworkGraph => {
    ctx.logger.debug.log("Select network graph subject %s => %s", type, id);

    const actorsArray = fp.Map.toArray(S.Ord)(eventGraph.actors).flatMap(
      ([_k, actors]) => actors
    );

    const groupsArray = fp.Map.toArray(S.Ord)(eventGraph.groups).flatMap(
      ([_k, groups]) => groups
    );

    const keywordsArray = fp.Map.toArray(S.Ord)(eventGraph.keywords).flatMap(
      ([_k, keywords]) => keywords
    );

    const actorsWithTypeArray = actorsArray.map((a) => ({
      ...a,
      type: ACTORS.value,
    }));

    const groupsWithTypeArray = groupsArray.map((a) => ({
      ...a,
      type: GROUPS.value,
    }));

    const keywordsWithTypeArray = keywordsArray.map((k) => ({
      ...k,
      type: KEYWORDS.value,
    }));

    const selectedNode =
      type === ACTORS.value
        ? actorsWithTypeArray.filter((a) => a.id === id)
        : type === GROUPS.value
        ? groupsWithTypeArray.filter((g) => g.id === id)
        : keywordsWithTypeArray.filter((k) => k.id === id);

    ctx.logger.info.log("Selected node %O", selectedNode);

    const nodes: any[] = [
      ...selectedNode,
      ...eventGraph.eventNodes,
      ...([groupBy, relation].includes(ACTORS.value)
        ? actorsWithTypeArray.filter((g) => g.id !== id)
        : []),
      ...([groupBy, relation].includes(GROUPS.value)
        ? groupsWithTypeArray.filter((g) => g.id !== id)
        : []),
      ...([groupBy, relation].includes(KEYWORDS.value)
        ? keywordsWithTypeArray.filter((g) => g.id !== id)
        : []),
    ];

    const actorLinksArray = fp.Map.toArray(S.Ord)(
      eventGraph.actorLinks
    ).flatMap(([_k, links]) => links);

    ctx.logger.debug.log(
      "actor links (%d): %O",
      actorLinksArray.length
      // actorLinksArray
    );

    const groupLinksArray = fp.Map.toArray(S.Ord)(
      eventGraph.groupLinks
    ).flatMap(([_k, links]) => links);

    ctx.logger.debug.log("group links (%d): %O", groupLinksArray.length);

    const keywordLinksArray = fp.Map.toArray(S.Ord)(
      eventGraph.keywordLinks
    ).flatMap(([_k, links]) => links);

    ctx.logger.debug.log(
      "Keyword links (%d): %O",
      keywordLinksArray.length,
      keywordLinksArray
    );

    const links = eventGraph.eventLinks.filter((l) => l.target !== l.source);

    const graph = {
      nodes,
      links,
    };

    return {
      events: eventGraph.eventNodes,
      groups: groupsArray,
      actors: actorsArray,
      keywords: keywordsArray,
      graph,
    };
  };

interface Result {
  eventNodes: EventNetworkDatum[];

  eventLinks: NetworkLink[];
  selectedEvents: UUID[];
  // actors
  actors: Map<string, Actor.Actor>;
  actorLinks: Map<string, NetworkLink[]>;
  // groups
  groups: Map<string, Group.Group>;
  groupLinks: Map<string, NetworkLink[]>;
  keywords: Map<string, Keyword.Keyword>;
  keywordLinks: Map<string, NetworkLink[]>;
}

const initialResult: Result = {
  eventNodes: [],
  eventLinks: [],
  actors: new Map(),
  actorLinks: new Map(),
  groups: new Map(),
  groupLinks: new Map(),
  keywords: new Map(),
  keywordLinks: new Map(),
  selectedEvents: [],
};

interface Graph {
  nodes: any[];
  links: any[];
}

interface NetworkGraph {
  graph: Graph;
  events: EventNetworkDatum[];
  groups: Group.Group[];
  actors: Actor.Actor[];
  keywords: Keyword.Keyword[];
}

export const createNetworkGraph =
  (ctx: RouteContext) =>
  (
    type: NetworkType,
    id: UUID,
    { groupBy, relation, emptyRelations, startDate, endDate }: GetNetworkQuery
  ): TE.TaskEither<ControllerError, Graph> => {
    const filePath = path.resolve(
      process.cwd(),
      `temp/networks/${type}/${id}-${groupBy}.json`
    );

    return pipe(
      TE.fromIOEither(
        fp.IOE.tryCatch(() => {
          const filePathDir = path.dirname(filePath);
          const tempFolderExists = fs.existsSync(filePathDir);
          if (!tempFolderExists) {
            ctx.logger.debug.log(
              "Folder %s does not exist, creating...",
              filePathDir
            );
            fs.mkdirSync(filePathDir, { recursive: true });
          }

          const statsExists = fs.existsSync(filePath);
          ctx.logger.debug.log(
            "Network file path %s exists? %s",
            path.relative(process.cwd(), filePath),
            statsExists
          );
          if (statsExists) {
            const { mtime } = fs.statSync(filePath);
            const hoursDelta = differenceInHours(new Date(), mtime);

            ctx.logger.debug.log(
              "Last network file update %s (%d h)",
              distanceFromNow(mtime),
              hoursDelta
            );

            return hoursDelta < 6;
          }

          return false;
        }, toControllerError)
      ),
      TE.chain((statsExist) => {
        if (statsExist) {
          return TE.fromIOEither(
            fp.IOE.tryCatch(() => {
              ctx.logger.debug.log(
                "Reading content from %s",
                path.relative(process.cwd(), filePath)
              );
              const content = fs.readFileSync(filePath, "utf-8");
              return JSON.parse(content);
            }, toControllerError)
          );
        }

        ctx.logger.debug.log("Creating graph for %s => %s", type, id);

        return pipe(
          walkPaginatedRequest(ctx)(
            ({ skip, amount }) =>
              searchEventV2Query(ctx)({
                ids: O.none,
                actors: type === ACTORS.value ? O.some([id]) : O.none,
                groups: type === GROUPS.value ? O.some([id]) : O.none,
                keywords: type === KEYWORDS.value ? O.some([id]) : O.none,
                skip,
                take: amount,
                order: { date: "DESC" },
              }),
            (r) => r.total,
            (r) => r.results,
            0,
            50
          ),
          TE.chain((results) => {
            ctx.logger.debug.log("Events found %d", results.length);

            return pipe(
              results,
              fp.A.traverse(fp.E.Applicative)(toEventV2IO),
              fp.TE.fromEither,
              fp.TE.map((events) => ({
                ...takeEventRelations(events),
                events,
              })),
              fp.TE.chain(({ events, ...relations }) =>
                pipe(
                  fetchRelations(ctx)({
                    keywords: pipe(
                      relations.keywords,
                      O.fromPredicate((a) => a.length > 0)
                    ),
                    actors: pipe(
                      relations.actors,
                      O.fromPredicate((a) => a.length > 0)
                    ),
                    groups: pipe(
                      relations.groups,
                      O.fromPredicate((g) => g.length > 0)
                    ),
                    groupsMembers: O.some(relations.groupsMembers),
                    links: O.none,
                    media: pipe(
                      relations.media,
                      O.fromPredicate((m) => m.length > 0)
                    ),
                  }),
                  TE.map((relations) => ({ ...relations, events }))
                )
              ),
              TE.chain(({ events, ...relations }) =>
                sequenceS(TE.ApplicativePar)({
                  events: fp.TE.right(events),
                  actors: pipe(
                    relations.actors,
                    fp.A.traverse(fp.E.Applicative)(toActorIO),
                    fp.TE.fromEither
                  ),
                  groups: pipe(
                    relations.groups,
                    fp.A.traverse(fp.E.Applicative)((g) =>
                      toGroupIO({ ...g, members: [] })
                    ),
                    fp.TE.fromEither
                  ),
                  keywords: pipe(
                    relations.keywords,
                    fp.A.traverse(fp.E.Applicative)(toKeywordIO),
                    fp.TE.fromEither
                  ),
                  media: pipe(
                    relations.media,
                    fp.A.traverse(fp.E.Applicative)((m) =>
                      toImageIO({ ...m, links: [], keywords: [], events: [] })
                    ),
                    fp.TE.fromEither
                  ),
                })
              )
            );
          }),
          TE.map(({ events: _events, actors, groups, keywords, media }) => {
            const events = pipe(
              _events,
              fp.A.map((aa) =>
                toSearchEvent(aa, {
                  events: [],
                  actors: new Map(actors.map((a) => [a.id, a])),
                  groups: new Map(groups.map((g) => [g.id, g])),
                  keywords: new Map(keywords.map((k) => [k.id, k])),
                  media: new Map(media.map((m) => [m.id, m])),
                  groupsMembers: new Map(),
                })
              )
            );

            const eventGraph = getEventGraph(ctx)(type, id, {
              events,
              actors,
              groups,
              keywords,
              media,
              relation,
              emptyRelations: pipe(
                emptyRelations,
                O.getOrElse(() => true)
              ),
              groupBy,
            });

            const results = makeGraph(ctx)(
              type,
              id,
              groupBy,
              relation,
              eventGraph
            );

            return results;
          }),
          TE.chainIOEitherK(({ graph }) => {
            return fp.IOE.tryCatch(() => {
              fs.writeFileSync(filePath, JSON.stringify(graph));
              return graph;
            }, toControllerError);
          })
        );
      }),
      TE.map((graph) => {
        ctx.logger.debug.log(
          "Filter nodes and links from %s to %s",
          O.toUndefined(startDate),
          O.toUndefined(endDate)
        );

        if (O.isSome(startDate)) {
          const nodes = graph.nodes.filter((n: any) => {
            if (Events.EventType.types.some((t) => t === n.type)) {
              const d = isDate(n.date) ? n.date : parseISO(n.date);

              return differenceInDays(new Date(startDate.value), d) === 0;
            }
            return n;
          });

          const links = graph.links.filter(
            (l: any) =>
              nodes.some((n: any) => l.target === n.id) &&
              nodes.some((n: any) => l.source === n.id)
          );

          return {
            nodes,
            links,
          };
        }

        return graph;
      })
    );
  };
