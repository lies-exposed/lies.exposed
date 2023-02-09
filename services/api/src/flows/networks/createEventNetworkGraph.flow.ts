import * as fs from "fs";
import path from "path";
import { fp } from "@liexp/core/fp";
import {
  eqByUUID,
  getEventsMetadata,
  takeEventRelations
} from "@liexp/shared/helpers/event/event";
import { getTitleForSearchEvent } from "@liexp/shared/helpers/event/getTitle.helper";
import { toSearchEvent } from "@liexp/shared/helpers/event/search-event";
import {
  type Actor,
  type Common,
  type Group,
  type Keyword,
  type Media
} from "@liexp/shared/io/http";
import { ACTORS } from "@liexp/shared/io/http/Actor";
import { type SearchEvent } from "@liexp/shared/io/http/Events";
import { GROUPS } from "@liexp/shared/io/http/Group";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import {
  type GetNetworkQuery,
  type NetworkGroupBy,
  type NetworkType
} from "@liexp/shared/io/http/Network";
import { type EventNetworkDatum } from "@liexp/shared/io/http/Network/networks";
import { distanceFromNow, parseISO } from "@liexp/shared/utils/date";
import { walkPaginatedRequest } from "@liexp/shared/utils/fp.utils";
import { differenceInHours } from "date-fns";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { sequenceS } from "fp-ts/lib/Apply";
import { type NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/string";
import { type UUID } from "io-ts-types/lib/UUID";
import { In } from "typeorm";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { toControllerError, type ControllerError } from "@io/ControllerError";
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
    type: NetworkType
    // id: UUID
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

interface GetEventGraphOpts {
  events: SearchEvent.SearchEvent[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  media: Media.Media[];
  emptyRelations: boolean;
  relation: NetworkGroupBy;
}

const getEventGraph =
  (ctx: RouteContext) =>
  (
    type: NetworkType,
    {
      events,
      actors: allActors,
      groups: allGroups,
      keywords: allKeywords,
      media: allMedia,
      relation,
      emptyRelations,
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
          fp.A.map((m) => m.thumbnail),
          fp.A.filter((m) => m !== undefined),
          fp.A.head,
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
            selected: true,
            date: e.date,
            groupBy: [],
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
          getLinks(eventNodes, acc.actorLinks, ACTORS.value, type)
        );

        // console.log('actor links', actorLinks);

        const groupLinks = pipe(
          nonEmptyEventGroups,
          O.getOrElse((): Group.Group[] => []),
          getLinks(eventNodes, acc.groupLinks, GROUPS.value, type)
        );

        const keywordLinks = pipe(
          nonEmptyEventKeywords,
          O.getOrElse((): Keyword.Keyword[] => []),
          getLinks(eventNodes, acc.keywordLinks, KEYWORDS.value, type)
        );

        const relationLinks = pipe(
          relationByEventList,
          O.map((arr) =>
            pipe(
              arr,
              A.reduce([] as NetworkLink[], (linkAcc, item) => {
                const sourceLinkIndex = acc.eventLinks.findIndex(
                  (l) => l.target === item.id
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

        // ctx.logger.debug.log("Event links %O", links);

        // const eventNodesToAdd = eventNodes;

        const evNodes: any[] = [...acc.eventNodes, ...eventNodes];

        return {
          eventNodes: evNodes,
          eventLinks: [...acc.eventLinks, ...relationLinks],
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
  (type: NetworkType, eventGraph: Result): NetworkGraph => {
    ctx.logger.debug.log("Select network graph subject %s => %s", type);

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
      type === "events"
        ? eventGraph.eventNodes
        : type === ACTORS.value
        ? actorsWithTypeArray
        : type === GROUPS.value
        ? groupsWithTypeArray
        : keywordsWithTypeArray;

    ctx.logger.info.log("Selected node %O", selectedNode);

    const nodes: any[] = [
      // ...selectedNode,
      ...eventGraph.eventNodes,
      ...actorsWithTypeArray,
      ...groupsWithTypeArray,
      ...keywordsWithTypeArray,
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

export interface Graph {
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

export const createEventNetworkGraph =
  (ctx: RouteContext) =>
  ({
    ids: _ids,
    relations: relation,
    emptyRelations,
    startDate,
    endDate,
    actors,
    groups,
    keywords,
  }: GetNetworkQuery): TE.TaskEither<ControllerError, Graph> => {
    const ids: UUID[] = pipe(
      _ids,
      O.fold(
        (): UUID[] => [],
        (id) => id
      )
    );

    const filePath = path.resolve(
      process.cwd(),
      `temp/networks/events/${ids.join("-")}.json`
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

            // return hoursDelta < 6;
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

        ctx.logger.debug.log("Creating graph for events => %s", ids.join(","));

        return pipe(
          ctx.db.find(EventV2Entity, {
            where: {
              id: In(ids),
            },
            loadRelationIds: {
              relations: ["keywords"],
            },
          }),
          TE.chainEitherK(
            fp.A.traverse(fp.E.Applicative)((ev) =>
              toEventV2IO({ ...ev, media: [], links: [] })
            )
          ),
          fp.TE.map((events) => ({
            ...takeEventRelations(events),
            events,
          })),
          TE.chain(
            ({
              events,
              actors: _actors,
              groups: _groups,
              keywords: _keywords,
            }) => {
              return walkPaginatedRequest(ctx)(
                ({ skip, amount }) =>
                  searchEventV2Query(ctx)({
                    ids: O.none,
                    actors: pipe(
                      actors,
                      O.alt(() => O.some(_actors)),
                      O.filter(A.isNonEmpty)
                    ),
                    groups: pipe(
                      groups,
                      O.alt(() => O.some(_groups)),
                      O.filter(A.isNonEmpty)
                    ),
                    keywords: pipe(
                      keywords,
                      O.alt(() => O.some(_keywords)),
                      O.filter(A.isNonEmpty)
                    ),
                    startDate: pipe(
                      startDate,
                      fp.O.map((d) => parseISO(d))
                    ),
                    endDate: pipe(
                      endDate,
                      fp.O.map((d) => parseISO(d))
                    ),
                    skip,
                    take: amount,
                    order: { date: "DESC" },
                  }),
                (r) => r.total,
                (r) => r.results,
                0,
                50
              );
            }
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
                  TE.chain((relations) =>
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
                          toImageIO({
                            ...m,
                            links: [],
                            keywords: [],
                            events: [],
                          })
                        ),
                        fp.TE.fromEither
                      ),
                    })
                  )
                )
              )
            );
          }),
          TE.map(({ events: _events, actors, groups, keywords, media }) => {
            ctx.logger.debug.log(`Events %d`, _events.length);
            ctx.logger.debug.log(`Actors %d`, actors.length);
            ctx.logger.debug.log(`Groups %d`, groups.length);
            ctx.logger.debug.log(`Keywords %d`, keywords.length);
            ctx.logger.debug.log(`Media %d`, media.length);
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

            const eventGraph = getEventGraph(ctx)("events", {
              events,
              actors,
              groups,
              keywords,
              media,
              relation: "keywords",
              emptyRelations: pipe(
                emptyRelations,
                O.getOrElse(() => true)
              ),
            });

            const results = makeGraph(ctx)("events", eventGraph);

            ctx.logger.debug.log("Graph results %O", {
              nodes: results.graph.nodes.length,
              links: results.graph.links.length,
            });
            return results;
          }),
          TE.chainIOEitherK(({ graph }) => {
            return fp.IOE.tryCatch(() => {
              fs.writeFileSync(filePath, JSON.stringify(graph));
              return graph;
            }, toControllerError);
          })
        );
      })
    );
  };
