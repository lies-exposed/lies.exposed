import {
  eqByUUID,
  eventDate,
  ordEventDate,
} from "@econnessione/shared/helpers/event";
import {
  Actor,
  Common,
  Events,
  Group,
  Page,
  Topic,
} from "@econnessione/shared/io/http";
import { Grid } from "@material-ui/core";
import { LegendItem, LegendLabel, LegendOrdinal } from "@vx/legend";
import { Link } from "@vx/network/lib/types";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import ordinalScale from "@vx/scale/lib/scales/ordinal";
import { ScaleOrdinal } from "d3";
import { subWeeks, differenceInDays } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as Eq from "fp-ts/lib/Eq";
import * as Map from "fp-ts/lib/Map";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import Network, { NetworkScale } from "../Common/Graph/Network/Network";
import {
  NetworkNodeDatum,
  NetworkPointNode,
} from "../Common/Graph/Network/NetworkNode";
import { ActorList } from "../lists/ActorList";
import { EventListItem } from "../lists/EventList/EventList";
import GroupList from "../lists/GroupList";

type GroupByItem = Actor.Actor | Group.Group;

type NetworkDatum = NetworkNodeDatum &
  Omit<Events.Uncategorized.Uncategorized, "actors" | "groups">;

interface EventNetworkDatum extends NetworkDatum {
  title: string;
  date: Date;
  groupBy: GroupByItem[];
  actors: O.Option<Actor.Actor[]>;
  groups: O.Option<Group.Group[]>;
  selected: boolean;
}

interface NetworkLink extends Link<NetworkPointNode<EventNetworkDatum>> {
  fill: string;
  stroke: string;
}

export interface EventsNetworkGraphProps {
  events: Events.Uncategorized.Uncategorized[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupBy: "group" | "actor";
  selectedActorIds: string[];
  selectedGroupIds: string[];
  selectedTopicIds: string[];
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
    selected: props.selectedActorIds.includes(a.id),
  }));
  const groups = props.groups.map((g) => ({
    ...g,
    selected: props.selectedGroupIds.includes(g.id),
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
                    setGroupBy(groupBy === "group" ? "actor" : "group");
                  }}
                >
                  Group by: {groupBy}
                </Grid>
              </Grid>

              <Grid item md={1}>
                {groupBy === "actor" ? (
                  <ActorList actors={actors} onActorClick={() => {}} />
                ) : (
                  <GroupList groups={groups} onGroupClick={() => {}} />
                )}
              </Grid>
              <Grid item md={11}>
                <div style={{ overflow: "auto" }}>
                  <Network<NetworkLink, EventNetworkDatum>
                    onDoubleClick={() => {}}
                    onNodeClick={() => {}}
                    onEventLabelClick={() => {}}
                    tooltipRenderer={(event) => {
                      const actors = pipe(
                        event.actors,
                        O.getOrElse((): Actor.Actor[] => [])
                      );
                      const groups = pipe(
                        event.groups,
                        O.getOrElse((): Group.Group[] => [])
                      );
                      return (
                        <EventListItem
                          event={{
                            ...event,
                            groups: groups.map((g) => g.id),
                            actors: actors.map((a) => a.id),
                          }}
                          actors={actors}
                          groups={groups}
                        />
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
  const pad = width / differenceInDays(maxDate, minDate);
  return differenceInDays(maxDate, date) * pad;
};

const getY =
  (topics: Array<{ id: string }>, margin: number, height: number) =>
  (itemId: string | undefined) => {
    if (itemId) {
      return pipe(
        topics,
        A.findIndex((t) => Eq.eqString.equals(t.id, itemId)),
        O.fold(
          () => margin + height / 2,
          (index) => {
            return margin + index * ((height - margin * 2) / topics.length);
          }
        )
      );
    }
    return height / 2 - margin;
  };

const updateMap =
  <F extends Common.BaseFrontmatter>(acc: Map<string, F>) =>
  (frontmatters: F[]): Map<string, F> => {
    return pipe(
      frontmatters,
      A.reduce(acc, (r, t) => {
        if (Map.elem(eqByUUID)(t, r)) {
          return r;
        }
        return Map.insertAt(Eq.eqString)(t.id, t)(r);
      })
    );
  };

const getLinks =
  (
    nodes: Array<NetworkPointNode<EventNetworkDatum>>,
    relationLinks: Map<string, NetworkLink[]>
  ) =>
  (
    relations: Array<Common.BaseFrontmatter & { color: string }>
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
                  stroke: `#${relation.color}`,
                  fill: `#${relation.color}`,
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
  selectedEvents: Events.Uncategorized.Uncategorized[];
  // group by
  groupByItems: Map<string, Actor.Actor | Group.Group>;
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
  groupBy: "actor" | "group" | "project";
  graph: {
    nodes: Array<NetworkPointNode<EventNetworkDatum>>;
    links: NetworkLink[];
  };
  selectedEvents: Events.Uncategorized.Uncategorized[];
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
  groupBy,
  scale,
  scalePoint,
  selectedActorIds,
  selectedGroupIds,
  selectedTopicIds,
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
    O.map((e) => eventDate(e)),
    O.getOrElse(() => subWeeks(new Date(), 1))
  );

  const maxDate = pipe(
    A.head(orderedEvents),
    O.map((e) => eventDate(e)),
    O.getOrElse(() => new Date())
  );

  const networkWidth = differenceInDays(maxDate, minDate) * 1;

  const yList = groupBy === "group" ? allGroups : allActors;
  // const topicsList = orderedEvents.reduce<Topic.TopicFrontmatter[]>(
  //   (acc, e) => [
  //     ...acc,
  //     ...allTopics.filter(
  //       (t) => !acc.some((i) => Eq.eqString.equals(i.id, t.id))
  //     ),
  //   ],
  //   []
  // );

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
        eventDate(e)
      );

      if (isBetweenDateRange) {
        const groupByEventList: GroupByItem[] =
          groupBy === "group"
            ? allGroups.filter((g) => e.groups.includes(g.id))
            : allActors.filter((a) => e.actors.includes(a.id));

        const groupByAllList: GroupByItem[] =
          groupBy === "group" ? allGroups : allActors;

        const groupByItem: GroupByItem | undefined = groupByAllList.find(
          (g) => {
            if (groupBy === "group") {
              return e.groups.includes(g.id);
            }
            return e.actors.includes(g.id);
          }
        );

        const eventNodes: Array<NetworkPointNode<EventNetworkDatum>> = [
          {
            x:
              margin.horizontal +
              getX(
                eventDate(e),
                minDate,
                maxDate,
                networkWidth - margin.horizontal * 2
              ),
            y: yGetter(groupByItem?.id),
            data: {
              ...e,
              selected: !!groupByItem,
              date: eventDate(e),
              groupBy: groupByItem ? [groupByItem] : [],
              actors: pipe(
                e.actors,
                O.fromPredicate(A.isNonEmpty),
                O.map((acts) => allActors.filter((a) => acts.includes(a.id)))
              ),
              groups: pipe(
                e.groups,
                O.fromPredicate(A.isNonEmpty),
                O.map((groups) =>
                  allGroups.filter((g) => groups.includes(g.id))
                )
              ),
              label: e.title,
              // color: groupByItem ? groupByItem.color : "#ccc",
              innerColor: groupByItem ? groupByItem.color : "#ccc",
              outerColor: groupByItem ? groupByItem.color : "#ccc",
            },
          },
        ];

        const actors = pipe(
          e.actors,
          O.fromPredicate((items) => items.length > 0),
          O.map((acts) => allActors.filter((a) => acts.includes(a.id))),
          O.getOrElse((): Actor.Actor[] => []),
          updateMap(acc.actors)
        );

        const groups = pipe(
          e.groups,
          O.fromPredicate((items) => items.length > 0),
          O.map((acts) => allGroups.filter((a) => acts.includes(a.id))),
          O.getOrElse((): Group.Group[] => []),
          updateMap(acc.groups)
        );

        const groupByItems = updateMap(acc.groupByItems)(groupByEventList);

        const groupByLinks = pipe(
          groupByEventList,
          A.filter((groupByItem) =>
            groupBy === "group"
              ? selectedGroupIds.includes(groupByItem.id)
              : selectedActorIds.includes(groupByItem.id)
          ),
          (items: GroupByItem[]) => {
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
          }
        );

        const actorLinks = pipe(
          actors,
          Map.toArray(Ord.ordString),
          A.map((v) => v[1]),
          A.filter((a) => selectedActorIds.includes(a.id)),
          getLinks(eventNodes, acc.actorLinks)
        );

        const groupLinks = pipe(
          e.groups,
          O.fromPredicate((items) => items.length > 0),
          O.map((acts) => allGroups.filter((a) => acts.includes(a.id))),
          O.getOrElse((): Group.Group[] => []),
          A.filter((a) => selectedGroupIds.includes(a.id)),
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
    domain: groupByArray.map((gb) =>
      Actor.Actor.is(gb) ? gb.username : gb.name
    ),
    range: groupByArray.map((t) => t.color.toString()),
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
      O.map((e) => e.startDate),
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
    width: width > networkWidth ? width : networkWidth,
    height: height,
  };
}
