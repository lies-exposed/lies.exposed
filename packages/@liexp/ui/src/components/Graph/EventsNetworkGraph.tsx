import {
  eqByUUID,
  getEventsMetadata,
  ordEventDate,
} from "@liexp/shared/helpers/event";
import { http } from "@liexp/shared/io";
import {
  Actor,
  Common,
  Events,
  Group,
  Keyword,
  Page,
  Topic,
} from "@liexp/shared/io/http";
import { UUID } from "@liexp/shared/io/http/Common/UUID";
import { SearchEvent } from "@liexp/shared/io/http/Events/SearchEvent";
import { LegendItem, LegendLabel, LegendOrdinal } from "@visx/legend";
import { Link } from "@visx/network/lib/types";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import ordinalScale from "@visx/scale/lib/scales/ordinal";
import { ScaleOrdinal } from "d3-scale";
import { subWeeks } from "date-fns";
import * as A from "fp-ts/Array";
import * as Map from "fp-ts/Map";
import * as NEA from "fp-ts/NonEmptyArray";
import * as O from "fp-ts/Option";
import * as Ord from "fp-ts/Ord";
import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import * as React from "react";
import { NetworkScale } from "../Common/Graph/Network/Network";
import {
  NetworkNodeDatum,
  NetworkPointNode,
} from "../Common/Graph/Network/NetworkNode";
import SankeyGraph from "../Common/Graph/SankeyGraph";
import { Box, Grid } from "../mui";

type GroupByItem = Actor.Actor | Group.Group | Keyword.Keyword;

type NetworkDatum = NetworkNodeDatum & SearchEvent;

type EventNetworkDatum = NetworkDatum & {
  title: string;
  groupBy: GroupByItem[];
  actors: O.Option<Actor.Actor[]>;
  groups: O.Option<Group.Group[]>;
  selected: boolean;
};

interface NetworkLink extends Link<UUID> {
  fill: string;
  value: number;
  stroke: string;
}

export interface EventsNetworkGraphProps {
  events: SearchEvent[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  groupBy: "group" | "actor" | "keyword";
  includeEmptyRelations: boolean;
  selectedActorIds: string[];
  selectedGroupIds: string[];
  selectedKeywordIds: string[];
  scale: NetworkScale;
  scalePoint: O.Option<NetworkPointNode<EventNetworkDatum>>;
  onEventClick: (e: EventNetworkDatum) => void;
}

export const EventsNetworkGraph: React.FC<EventsNetworkGraphProps> = (
  props
) => {
  const [groupBy, setGroupBy] = React.useState(props.groupBy);
  // const actors = props.actors.map((a) => ({
  //   ...a,
  //   selected: true,
  // }));
  // const groups = props.groups.map((g) => ({
  //   ...g,
  //   selected: true,
  // }));

  // const keywords = props.keywords.map((k) => ({
  //   ...k,
  //   selected: true,
  // }));

  return (
    <Box display="flex" flexDirection="column" width="100%">
      <ParentSize style={{ minHeight: 400 }}>
        {({ width, height }) => {
          const networkProps = createEventNetworkGraphProps({
            ...props,
            groupBy,
            width,
            height: 800,
            margin: { vertical: 40, horizontal: 40 },
          });

          return (
            <Grid container spacing={3}>
              <Grid item md={12}>
                <Grid
                  item
                  md={12}
                  onClick={() => {
                    const nextGroupBy =
                      groupBy === "actor"
                        ? "group"
                        : groupBy === "group"
                        ? "keyword"
                        : "actor";
                    setGroupBy(nextGroupBy);
                  }}
                >
                  Group by: {groupBy}
                </Grid>
              </Grid>

              {/* <Grid item md={1}>
                {groupBy === "actor" ? (
                  <ActorList actors={actors} onActorClick={() => {}} />
                ) : groupBy === "group" ? (
                  <GroupList groups={groups} onItemClick={() => {}} />
                ) : (
                  <KeywordList
                    keywords={keywords}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onItemClick={() => {}}
                  />
                )}
              </Grid> */}
              <Grid item md={12}>
                <div style={{ width: "100%" }}>
                  <SankeyGraph
                    {...networkProps}
                    onEventClick={props.onEventClick}
                  />
                  {/* <Network<NetworkLink, EventNetworkDatum>
                    onDoubleClick={() => {}}
                    onNodeClick={() => {}}
                    onEventLabelClick={() => {}}
                    tooltipRenderer={(event) => {
                      // const actors = pipe(
                      //   event.actors,
                      //   O.getOrElse((): Actor.Actor[] => [])
                      // );
                      // const groups = pipe(
                      //   event.groups,
                      //   O.getOrElse((): Group.Group[] => [])
                      // );

                      return (
                        <Box border={1}>
                          <EventListItem
                            event={event}
                            onClick={() => {}}
                            onActorClick={() => {}}
                            onGroupClick={() => {}}
                            onKeywordClick={() => {}}
                            onGroupMemberClick={() => {}}
                          />
                        </Box>
                      );
                    }}
                    {...networkProps}
                  /> */}
                </div>
                <div className="legends">
                  <LegendDemo title="Topics">
                    <LegendOrdinal<typeof networkProps.groupByScale>
                      scale={networkProps.groupByScale}
                      labelFormat={(datum) => datum}
                    >
                      {(labels) => {
                        return (
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            {labels.map((label, i) => (
                              <LegendItem
                                key={`legend-quantile-${i}`}
                                margin="0 5px"
                                onClick={() => {}}
                              >
                                <svg width={10} height={10}>
                                  <circle
                                    fill={label.value}
                                    r={4}
                                    cy={4}
                                    cx={4}
                                  />
                                </svg>
                                <LegendLabel align="left" margin="0 0 0 4px">
                                  {label.text}
                                </LegendLabel>
                              </LegendItem>
                            ))}
                          </div>
                        );
                      }}
                    </LegendOrdinal>
                  </LegendDemo>
                  <LegendDemo title="Actors">
                    <LegendOrdinal
                      scale={networkProps.actorsScale}
                      labelFormat={(datum) => datum}
                    >
                      {(labels) => {
                        return (
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            {labels.map((label, i) => (
                              <LegendItem
                                key={`legend-quantile-${i}`}
                                margin="0 5px"
                                onClick={() => {}}
                              >
                                <svg width={10} height={2}>
                                  <rect
                                    fill={label.value}
                                    width={10}
                                    height={2}
                                  />
                                </svg>
                                <LegendLabel align="left" margin="0 0 0 4px">
                                  {label.text}
                                </LegendLabel>
                              </LegendItem>
                            ))}
                          </div>
                        );
                      }}
                    </LegendOrdinal>
                  </LegendDemo>
                  <LegendDemo title="Groups">
                    <LegendOrdinal
                      scale={networkProps.groupsScale}
                      labelFormat={(datum) => {
                        return datum;
                      }}
                    >
                      {(labels) => {
                        return (
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            {labels.map((label, i) => (
                              <LegendItem
                                key={`legend-quantile-${i}`}
                                margin="0 5px"
                                onClick={() => {}}
                              >
                                <svg width={10} height={2}>
                                  <rect
                                    fill={label.value}
                                    width={10}
                                    height={2}
                                  />
                                </svg>
                                <LegendLabel align="left" margin="0 0 0 4px">
                                  {label.text}
                                </LegendLabel>
                              </LegendItem>
                            ))}
                          </div>
                        );
                      }}
                    </LegendOrdinal>
                  </LegendDemo>
                  <style>{`
              .legends {
                font-family: arial;
                font-weight: 900;
                background-color: white;
                border-radius: 14px;
                padding: 24px 24px 24px 32px;
                overflow-y: auto;
                flex-grow: 1;
              }
              .chart h2 {
                margin-left: 10px;
              }
            `}</style>
                </div>
              </Grid>
            </Grid>
          );
        }}
      </ParentSize>
    </Box>
  );
};

function LegendDemo({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="legend">
      <div className="title">{title}</div>
      {children}
      <style>{`
        .legend {
          line-height: 0.9em;
          color: darkgrey;
          font-size: 10px;
          font-family: arial;
          padding: 10px 10px;
          float: left;
          border: 1px solid rgba(100, 100, 100, 0.3);
          border-radius: 8px;
          margin: 5px 5px;
        }
        .title {
          font-size: 12px;
          margin-bottom: 10px;
          font-weight: 100;
        }
      `}</style>
    </div>
  );
}

// calculate x based on date
// (date - minDate) : (maxDate - minDate) = x : width
// x = (date - minDate) * width / (maxDate - minDate)
// const getX = (
//   date: Date,
//   minDate: Date,
//   maxDate: Date,
//   width: number
// ): number => {
//   const pad = width / differenceInCalendarDays(maxDate, minDate);

//   const x = differenceInCalendarDays(maxDate, date) * pad;

//   return x;
// };

// const getY =
//   (topics: Array<{ id: string }>, margin: number, height: number) =>
//   (itemId: string | undefined) => {
//     const defaultY = height - margin;
//     if (itemId) {
//       return pipe(
//         topics,
//         A.findIndex((t) => S.Eq.equals(t.id, itemId)),
//         O.fold(
//           () => defaultY,
//           (index) => {
//             return margin + index * ((height - margin * 2) / topics.length);
//           }
//         )
//       );
//     }
//     return defaultY;
//   };

const updateMap =
  <F extends Common.BaseProps>(acc: Map<string, F>) =>
  (items: F[]): Map<string, F> => {
    return pipe(
      items,
      A.reduce(acc, (r, t) => {
        if (Map.elem(eqByUUID)(t, r)) {
          return r;
        }
        return Map.upsertAt(S.Eq)(t.id, t)(r);
      })
    );
  };

const getLinks =
  (nodes: EventNetworkDatum[], relationLinks: Map<string, NetworkLink[]>) =>
  (
    relations: Array<Common.BaseProps & { color: string }>
  ): Map<string, NetworkLink[]> => {
    return pipe(
      nodes,
      A.reduce(relationLinks, (acc, p) => {
        const newLinks = pipe(
          relations,
          A.reduce(acc, (acc1, relation) => {
            const lastLinks = pipe(
              Map.lookup(S.Ord)(relation.id, acc1),
              O.getOrElse((): NetworkLink[] => [])
            );

            // console.log('last links', lastLinks);

            if (lastLinks.length === 0) {
              return pipe(
                acc1,
                Map.upsertAt(S.Eq)(relation.id, [
                  {
                    source: relation.id,
                    target: p.id,
                    value: (1 / relations.length) * 100,
                    stroke: `#${relation.color}`,
                    fill: `#${relation.color}`,
                  },
                ])
              );
            }

            const lastLink = lastLinks[lastLinks.length - 1];

            const eventLinks = [
              ...lastLinks,
              {
                source: lastLink.target,
                target: p.id,
                value: (1 / relations.length) * 100,
                stroke: `#${relation.color}`,
                fill: `#${relation.color}`,
              },
            ];

            return pipe(acc1, Map.upsertAt(S.Eq)(relation.id, eventLinks));
          })
        );

        return newLinks;
      })
    );
  };

interface Result {
  eventNodes: EventNetworkDatum[];
  selectedEvents: SearchEvent[];
  maxSize: number;
  // group by
  groupByItems: Map<string, GroupByItem>;
  groupByLinks: Map<string, NetworkLink[]>;
  // actors
  actors: Map<string, Actor.Actor>;
  actorLinks: Map<string, NetworkLink[]>;
  // groups
  groups: Map<string, Group.Group>;
  groupLinks: Map<string, NetworkLink[]>;
}

export interface EventsNetworkGraphData {
  pageContent: Page.Page;
  topics: {
    nodes: Topic.TopicMD[];
  };
  actors: {
    nodes: Actor.Actor[];
  };
  groups: {
    nodes: Group.Group[];
  };
  events: {
    nodes: Events.Uncategorized.Uncategorized[];
  };
}

export interface EventsNetworkGraphDataProps {
  minDate: Date;
  maxDate: Date;
  scale: NetworkScale;
  groupBy: "actor" | "group" | "keyword";
  graph: {
    nodes: EventNetworkDatum[];
    links: NetworkLink[];
  };
  selectedEvents: SearchEvent[];
  width: number;
  height: number;
  groupByScale: ScaleOrdinal<string, string>;
  actorsScale: ScaleOrdinal<string, string>;
  groupsScale: ScaleOrdinal<string, string>;
}

export function createEventNetworkGraphProps({
  events,
  actors: allActors,
  groups: allGroups,
  keywords: allKeywords,
  groupBy,
  scale,
  includeEmptyRelations,
  scalePoint,
  selectedActorIds,
  selectedGroupIds,
  selectedKeywordIds,
  height,
  width,
  margin,
}: EventsNetworkGraphProps & {
  width: number;
  height: number;
  margin: { vertical: number; horizontal: number };
}): EventsNetworkGraphDataProps {
  const orderedEvents = pipe(events, A.sort(ordEventDate));

  const minDate = pipe(
    A.head(orderedEvents),
    O.map((e) => e.date),
    O.getOrElse(() => subWeeks(new Date(), 1))
  );

  const maxDate = pipe(
    A.last(orderedEvents),
    O.map((e) => e.date),
    O.getOrElse(() => new Date())
  );

  // console.log({ minDate, maxDate });

  // const networkWidth = differenceInCalendarDays(maxDate, minDate) * 2;

  // console.log({ networkWidth });
  // const yList =
  //   groupBy === "group"
  //     ? allGroups
  //     : groupBy === "actor"
  //     ? allActors
  //     : allKeywords;

  // const yGetter = getY(yList, margin.vertical, height);

  const result: Result = {
    eventNodes: [],
    maxSize: 0,
    groupByLinks: Map.empty,
    actorLinks: Map.empty,
    groupLinks: Map.empty,
    groupByItems: Map.empty,
    actors: Map.empty,
    groups: Map.empty,
    selectedEvents: [],
  };

  // console.log({ groupBy });

  const {
    eventNodes,
    selectedEvents,
    // groupByLinks,
    actorLinks,
    groupLinks,
    groupByItems,
    actors,
    groups,
    maxSize,
  } = pipe(
    orderedEvents,
    A.reduce(result, (acc, e) => {
      // get topic from relative directory
      const isBetweenDateRange = Ord.between(Ord.ordDate)(minDate, maxDate)(
        e.date
      );

      if (isBetweenDateRange) {
        const eventTitle =
          e.type === "Death"
            ? `Death of ${e.payload.victim.fullName}`
            : e.type === http.Events.Quote.QUOTE.value
            ? `Quote by: ${e.payload.actor.fullName}`
            : e.payload.title;

        const {
          actors: eventActors,
          groups: eventGroups,
          keywords: eventKeywords,
        } = getEventsMetadata(e);

        const filteredEventActors = pipe(
          eventActors,
          O.fromPredicate(A.isNonEmpty)
        );
        const filteredEventGroups = pipe(
          eventGroups,
          O.fromPredicate(A.isNonEmpty)
        );

        // console.log({ filteredEventActors, filteredEventGroups });

        if (
          !includeEmptyRelations &&
          (O.isSome(filteredEventActors) || O.isSome(filteredEventGroups))
        ) {
          const groupByEventList: GroupByItem[] =
            groupBy === "group"
              ? eventGroups
              : groupBy === "actor"
              ? eventActors
              : eventKeywords;

          // console.log("event actors", groupByEventList)
          const groupByItem: GroupByItem | undefined = groupByEventList[0];

          const eventNodes: EventNetworkDatum[] = [
            {
              ...e,
              title: eventTitle,
              selected: !!groupByItem,
              date: e.date,
              groupBy: groupByItem ? [groupByItem] : [],
              actors: filteredEventActors,
              groups: filteredEventGroups,
              label: eventTitle,
              innerColor: groupByItem?.color
                ? `#${groupByItem.color}`
                : "#FF0000",
              outerColor: groupByItem?.color
                ? `#${groupByItem.color}`
                : "#FF0000",
            },
          ];

          // console.log(
          //   "event actors",
          //   eventActors
          // );

          const actors = pipe(
            allActors.filter((a) => eventActors.some((aa) => aa.id === a.id)),
            O.fromPredicate(A.isNonEmpty),
            O.getOrElse((): Actor.Actor[] => []),
            updateMap(acc.actors)
          );

          // console.log("actors", actors);

          const groups = pipe(
            allGroups.filter((a) => eventGroups.some((aa) => aa.id === a.id)),
            O.fromPredicate(A.isNonEmpty),
            O.getOrElse((): Group.Group[] => []),
            updateMap(acc.groups)
          );

          // console.log("groups", groups);

          const groupByItems = updateMap(acc.groupByItems)(groupByEventList);

          // const groupByLinks = pipe(groupByEventList, (items: GroupByItem[]) => {
          //   const emptyMap: Map<string, NetworkLink[]> = Map.empty;
          //   return pipe(
          //     items.map((item) =>
          //       getLinks(
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
          const actorLinks = pipe(
            eventActors,
            getLinks(eventNodes, acc.actorLinks)
          );

          // console.log('actor links', actorLinks);

          const groupLinks = pipe(
            eventGroups,
            // O.fromPredicate((items) => items.length > 0),
            // O.getOrElse((): Group.Group[] => []),
            // A.filter((a) => selectedGroupIds.includes(a.id)),
            getLinks(eventNodes, acc.groupLinks)
          );

          const evNodes = [...acc.eventNodes, ...eventNodes];
          return {
            eventNodes: evNodes,
            maxSize:
              evNodes.length > acc.maxSize ? evNodes.length : acc.maxSize,
            actorLinks,
            groupByLinks: Map.empty,
            groupLinks,
            groupByItems,
            actors,
            groups,
            selectedEvents: [...acc.selectedEvents, e],
          };
        }
      }

      return acc;
    })
  );

  const groupByArray: NEA.NonEmptyArray<GroupByItem> = Map.toArray(S.Ord)(
    groupByItems
  ).flatMap(([_k, items]) => items) as any;

  const groupByScale = ordinalScale({
    domain: groupByArray.map((gb: any) =>
      groupBy === "actor" ? gb.username : groupBy === "group" ? gb.name : gb.tag
    ),
    range: groupByArray.map((t) => `#${t.color}`),
  });

  const actorsArray = Map.toArray(S.Ord)(actors).flatMap(
    ([_k, actors]) => actors
  );
  const actorsScale = ordinalScale({
    domain: actorsArray.map((a) => a.fullName),
    range: actorsArray.map((a) => `#${a.color}`),
  });

  const groupsArray = Map.toArray(S.Ord)(groups).flatMap(
    ([_k, groups]) => groups
  );

  const groupsScale = ordinalScale({
    domain: groupsArray.map((g) => g.name),
    range: groupsArray.map((a) => `#${a.color}`),
  });

  // const actorLinksList = Map.toArray(Ord.ordString)(actorLinks).flatMap(
  //   ([_k, links]) => links
  // );

  // console.log("actors", actors);

  // const groupingByNodes = pipe(
  //   (groupBy === "group" ? groups : actors) as Map<string, any>,
  //   Map.toArray(S.Ord),
  //   A.map(([key, items]) => items)
  // );
  // const groupingByLinks = groupBy === "group" ? groupLinks : actorLinks;

  // console.log("group by nodes", groupingByNodes);
  const nodes = [
    ...(actorsArray as any),
    ...(groupsArray as any),
    ...eventNodes,
  ];
  // console.log("all nodes", nodes);

  const links = [
    ...Map.toArray(S.Ord)(actorLinks).flatMap(([_k, links]) => links),
    ...Map.toArray(S.Ord)(groupLinks).flatMap(([_k, links]) => links),
    // ...Map.toArray(Ord.ordString)(topicLinks).flatMap(
    //   ([_k, links]) => links
    // ),
    // ...actorLinksList,
  ].filter(
    (l) => l.target !== l.source
    // && nodes.some((n) => n.id === l.target || n.id === l.source)
  );

  // console.log("group by links", links);
  // console.log("group by nodes", nodes);

  return {
    minDate: pipe(
      A.head(selectedEvents),
      O.map((e) => e.date),
      O.getOrElse(() => subWeeks(new Date(), 1))
    ),
    maxDate,
    scale,
    groupBy,
    graph: {
      nodes,
      links,
    },
    groupByScale,
    actorsScale,
    groupsScale,
    selectedEvents,
    width,
    height: maxSize * (45 + 10),
  };
}
