import { eqByUUID, ordEventDate } from "@econnessione/shared/helpers/event";
import {
  Actor,
  Common,
  Events,
  Group,
  Keyword,
  Page,
  Topic,
} from "@econnessione/shared/io/http";
import { Box, Grid } from "@material-ui/core";
import { LegendItem, LegendLabel, LegendOrdinal } from "@vx/legend";
import { Link } from "@vx/network/lib/types";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import ordinalScale from "@vx/scale/lib/scales/ordinal";
import { ScaleOrdinal } from "d3-scale";
import { differenceInCalendarDays, subWeeks } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as Eq from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/function";
import * as Map from "fp-ts/lib/Map";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import * as React from "react";
import Network, { NetworkScale } from "../Common/Graph/Network/Network";
import {
  NetworkNodeDatum,
  NetworkPointNode,
} from "../Common/Graph/Network/NetworkNode";
import { ActorList } from "../lists/ActorList";
import { EventListItem, SearchEvent } from "../lists/EventList/EventListItem";
import GroupList from "../lists/GroupList";
import KeywordList from "../lists/KeywordList";

type GroupByItem = Actor.Actor | Group.Group | Keyword.Keyword;

type NetworkDatum = NetworkNodeDatum & SearchEvent;

type EventNetworkDatum = NetworkDatum & {
  title: string;
  groupBy: GroupByItem[];
  actors: O.Option<Actor.Actor[]>;
  groups: O.Option<Group.Group[]>;
  selected: boolean;
};

interface NetworkLink extends Link<NetworkPointNode<EventNetworkDatum>> {
  fill: string;
  stroke: string;
}

export interface EventsNetworkGraphProps {
  events: SearchEvent[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  groupBy: "group" | "actor" | "keyword";
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
  const actors = props.actors.map((a) => ({
    ...a,
    selected: true,
  }));
  const groups = props.groups.map((g) => ({
    ...g,
    selected: true,
  }));

  const keywords = props.keywords.map((k) => ({
    ...k,
    selected: true,
  }));

  return (
    <>
      <ParentSize style={{ minHeight: 400 }}>
        {({ width, height }) => {
          const networkProps = createEventNetworkGraphProps({
            ...props,
            groupBy,
            width,
            height: 400,
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

              <Grid item md={1}>
                {groupBy === "actor" ? (
                  <ActorList actors={actors} onActorClick={() => {}} />
                ) : groupBy === "group" ? (
                  <GroupList groups={groups} onGroupClick={() => {}} />
                ) : (
                  <KeywordList keywords={keywords} onItemClick={() => {}} />
                )}
              </Grid>
              <Grid item md={11}>
                <div style={{ overflow: "auto" }}>
                  <Network<NetworkLink, EventNetworkDatum>
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
                  />
                </div>
                <div className="legends">
                  <LegendDemo title="Topics">
                    <LegendOrdinal
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
                                    fill={`#${label.value}`}
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
                                    fill={`#${label.value}`}
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
                    <LegendOrdinal<ScaleOrdinal<string, string>>
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
                                    fill={`#${label.value}`}
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
    </>
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
const getX = (
  date: Date,
  minDate: Date,
  maxDate: Date,
  width: number
): number => {
  const pad = width / differenceInCalendarDays(maxDate, minDate);

  const x = differenceInCalendarDays(maxDate, date) * pad;

  return x;
};

const getY =
  (topics: Array<{ id: string }>, margin: number, height: number) =>
  (itemId: string | undefined) => {
    const defaultY = height - margin;
    if (itemId) {
      return pipe(
        topics,
        A.findIndex((t) => Eq.eqString.equals(t.id, itemId)),
        O.fold(
          () => defaultY,
          (index) => {
            return margin + index * ((height - margin * 2) / topics.length);
          }
        )
      );
    }
    return defaultY;
  };

const updateMap =
  <F extends Common.BaseProps>(acc: Map<string, F>) =>
  (items: F[]): Map<string, F> => {
    return pipe(
      items,
      A.reduce(acc, (r, t) => {
        if (Map.elem(eqByUUID)(t, r)) {
          return r;
        }
        return Map.upsertAt(Eq.eqString)(t.id, t)(r);
      })
    );
  };

const getLinks =
  (
    nodes: Array<NetworkPointNode<EventNetworkDatum>>,
    relationLinks: Map<string, NetworkLink[]>
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
            const lastLinks = pipe(
              Map.lookup(Ord.ordString)(relation.id, acc1),
              O.getOrElse((): NetworkLink[] => [])
            );

            return pipe(
              acc1,
              Map.insertAt(Eq.eqString)(relation.id, [
                ...lastLinks,
                {
                  source: pipe(
                    A.last(lastLinks),
                    O.map((l) => l.target),
                    O.getOrElse(() => p)
                  ),
                  target: p,
                  stroke: `#${relation.color.replace("#", "")}`,
                  fill: `#${relation.color.replace("#", "")}`,
                },
              ])
            );
          })
        );
        return newLinks;
      })
    );
  };

interface Result {
  eventNodes: Array<NetworkPointNode<EventNetworkDatum>>;
  selectedEvents: SearchEvent[];
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
  pageContent: Page.PageMD;
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
    nodes: Array<NetworkPointNode<EventNetworkDatum>>;
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
  const orderedEvents = pipe(events, A.sort(Ord.reverse(ordEventDate)));

  const minDate = pipe(
    A.last(orderedEvents),
    O.map((e) => e.date),
    O.getOrElse(() => subWeeks(new Date(), 1))
  );

  const maxDate = pipe(
    A.head(orderedEvents),
    O.map((e) => e.date),
    O.getOrElse(() => new Date())
  );

  const networkWidth = differenceInCalendarDays(maxDate, minDate) * 10;

  const yList =
    groupBy === "group"
      ? allGroups
      : groupBy === "actor"
      ? allActors
      : allKeywords;

  const yGetter = getY(yList, margin.vertical, height);

  const result: Result = {
    eventNodes: [],
    groupByLinks: Map.empty,
    actorLinks: Map.empty,
    groupLinks: Map.empty,
    groupByItems: Map.empty,
    actors: Map.empty,
    groups: Map.empty,
    selectedEvents: [],
  };

  const {
    eventNodes,
    selectedEvents,
    groupByLinks: topicLinks,
    actorLinks,
    groupLinks,
    groupByItems,
    actors,
    groups,
  } = pipe(
    events,
    A.reduce(result, (acc, e) => {
      // get topic from relative directory
      const isBetweenDateRange = Ord.between(Ord.ordDate)(minDate, maxDate)(
        e.date
      );

      if (isBetweenDateRange) {
        const eventTitle = e.type === "Death" ? "Died" : e.payload.title;
        const eventActors =
          e.type === "Death"
            ? [e.payload.victim]
            : e.type === "ScientificStudy"
            ? e.payload.authors
            : e.payload.actors;
        const eventGroups =
          e.type === "Death"
            ? []
            : e.type === "ScientificStudy"
            ? [e.payload.publisher]
            : e.payload.groups;

        const eventKeywords = e.keywords;

        const groupByEventList: GroupByItem[] =
          groupBy === "group"
            ? eventGroups
            : groupBy === "actor"
            ? eventActors
            : eventKeywords;

        const groupByItem: GroupByItem | undefined = groupByEventList[0];

        console.log({ groupByItem });

        const eventNodes: Array<NetworkPointNode<EventNetworkDatum>> = [
          {
            x:
              margin.horizontal +
              getX(
                e.date,
                minDate,
                maxDate,
                networkWidth - margin.horizontal * 2
              ),
            y: yGetter(groupByItem?.id),
            data: {
              ...e,
              title: eventTitle,
              selected: !!groupByItem,
              date: e.date,
              groupBy: groupByItem ? [groupByItem] : [],
              actors: pipe(eventActors, O.fromPredicate(A.isNonEmpty)),
              groups: pipe(eventGroups, O.fromPredicate(A.isNonEmpty)),
              label: eventTitle,
              innerColor: groupByItem
                ? // ? groupByItem.color.replace("#", "")
                  "#f00"
                : "#ccc",
              outerColor: groupByItem
                ? // ? groupByItem.color.replace("#", "")
                  "#f00"
                : "#ccc",
            },
          },
        ];

        const actors = pipe(
          eventActors,
          O.fromPredicate((items) => items.length > 0),
          O.map((acts) =>
            allActors.filter((a) => acts.some((aa) => aa.id === a.id))
          ),
          O.getOrElse((): Actor.Actor[] => []),
          updateMap(acc.actors)
        );

        const groups = pipe(
          eventGroups,
          O.fromPredicate((items) => items.length > 0),
          O.map((acts) =>
            allGroups.filter((a) => acts.some((aa) => aa.id === a.id))
          ),
          O.getOrElse((): Group.Group[] => []),
          updateMap(acc.groups)
        );

        const groupByItems = updateMap(acc.groupByItems)(groupByEventList);

        const groupByLinks = pipe(groupByEventList, (items: GroupByItem[]) => {
          const emptyMap: Map<string, NetworkLink[]> = Map.empty;
          return pipe(
            items.map((item) =>
              getLinks(
                eventNodes.filter(
                  (e) =>
                    e.data.groupBy.findIndex((tt) => tt.id === item.id) === 0
                ),
                acc.groupByLinks
              )([])
            ),
            A.reduce(emptyMap, (mm, m) => {
              return pipe(
                m,
                Map.keys(Ord.ordString),
                A.reduce(mm, (acc, key) => {
                  return pipe(
                    Map.lookup(Eq.eqString)(key, m),
                    O.map((mapLinks) =>
                      pipe(
                        Map.lookup(Eq.eqString)(key, acc),
                        O.map((accLinks) => [...accLinks, ...mapLinks]),
                        O.getOrElse(() => mapLinks),
                        (links) => Map.insertAt(Eq.eqString)(key, links)(acc)
                      )
                    ),
                    O.getOrElse((): Map<string, NetworkLink[]> => acc)
                  );
                })
              );
            })
          );
        });

        const actorLinks = pipe(
          actors,
          Map.toArray(Ord.ordString),
          A.map((v) => v[1]),
          // A.filter((a) => selectedActorIds.includes(a.id)),
          getLinks(eventNodes, acc.actorLinks)
        );

        const groupLinks = pipe(
          eventGroups,
          O.fromPredicate((items) => items.length > 0),
          O.getOrElse((): Group.Group[] => []),
          // A.filter((a) => selectedGroupIds.includes(a.id)),
          getLinks(eventNodes, acc.groupLinks)
        );

        return {
          eventNodes: [...acc.eventNodes, ...eventNodes],
          actorLinks,
          groupByLinks,
          groupLinks,
          groupByItems,
          actors,
          groups,
          selectedEvents: [...acc.selectedEvents, e],
        };
      }

      return acc;
    })
  );

  const groupByArray: NEA.NonEmptyArray<GroupByItem> = Map.toArray(
    Ord.ordString
  )(groupByItems).flatMap(([_k, items]) => items) as any;

  const groupByScale = ordinalScale({
    domain: groupByArray.map((gb: any) =>
      groupBy === "actor" ? gb.username : groupBy === "group" ? gb.name : gb.tag
    ),
    range: groupByArray.map((t) => (t as any).color),
  });

  const actorsArray = Map.toArray(Ord.ordString)(actors).flatMap(
    ([_k, actors]) => actors
  );
  const actorsScale = ordinalScale({
    domain: actorsArray.map((a) => a.fullName),
    range: actorsArray.map((a) => a.color.toString()),
  });

  const groupsArray = Map.toArray(Ord.ordString)(groups).flatMap(
    ([_k, groups]) => groups
  );

  const groupsScale = ordinalScale({
    domain: groupsArray.map((g) => g.name),
    range: groupsArray.map((a) => a.color.toString()),
  });

  const actorLinksList = Map.toArray(Ord.ordString)(actorLinks).flatMap(
    ([_k, links]) => links
  );

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
      nodes: eventNodes,
      links: [
        ...Map.toArray(Ord.ordString)(actorLinks).flatMap(
          ([_k, links]) => links
        ),
        ...Map.toArray(Ord.ordString)(topicLinks).flatMap(
          ([_k, links]) => links
        ),
        ...actorLinksList,
        ...Map.toArray(Ord.ordString)(groupLinks).flatMap(
          ([_k, links]) => links
        ),
      ],
    },
    groupByScale: groupByScale,
    actorsScale: actorsScale,
    groupsScale: groupsScale,
    selectedEvents,
    width: networkWidth,
    height: height,
  };
}
