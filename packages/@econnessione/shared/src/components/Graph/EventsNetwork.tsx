import Network, {
  NetworkScale,
} from "@components/Common/Graph/Network/Network";
import {
  NetworkNodeDatum,
  NetworkPointNode,
} from "@components/Common/Graph/Network/NetworkNode";
import { ActorList } from "@components/lists/ActorList";
import { eventDate, ordEventDate, eqByUUID } from "@helpers/event";
import { Actor, Common, Events, Group, Page, Topic } from "@io/http";
import { formatDate } from "@utils/date";
import { LegendItem, LegendLabel, LegendOrdinal } from "@vx/legend";
import { Link } from "@vx/network/lib/types";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import ordinalScale from "@vx/scale/lib/scales/ordinal";
import { ScaleOrdinal } from "d3";
import { subWeeks } from "date-fns";
import { differenceInDays } from "date-fns/esm";
import * as A from "fp-ts/lib/Array";
import * as Eq from "fp-ts/lib/Eq";
import * as Map from "fp-ts/lib/Map";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

interface EventNetworkDatum extends NetworkNodeDatum {
  title: string;
  date: Date;
  groupBy: NEA.NonEmptyArray<Actor.Actor | Group.Group>;
  actors: O.Option<Actor.Actor[]>;
}

interface NetworkLink extends Link<NetworkPointNode<EventNetworkDatum>> {
  fill: string;
  stroke: string;
}

export interface EventsNetworkProps {
  events: Events.Uncategorized.Uncategorized[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupBy: "group" | "actor";
  selectedActorIds: string[];
  selectedGroupIds: string[];
  selectedTopicIds: string[];
  scale: NetworkScale;
  scalePoint: O.Option<NetworkPointNode<EventNetworkDatum>>;
}

export const EventsNetwork: React.FC<EventsNetworkProps> = (props) => {
  return (
    <>
      <ParentSize style={{ minHeight: 400 }}>
        {({ width, height }) => {
          const networkProps = createNetworkTemplateProps({
            ...props,
            width,
            height: 400,
            margin: { vertical: 40, horizontal: 40 },
          });
          return (
            <div>
              <div style={{ overflow: "auto" }}>
                <Network<NetworkLink, EventNetworkDatum>
                  onDoubleClick={() => {}}
                  onNodeClick={() => {}}
                  onEventLabelClick={() => {}}
                  tooltipRenderer={(tooltipData) => {
                    return (
                      <div>
                        <label>{tooltipData.title}</label>
                        <label>Data: {formatDate(tooltipData.date)}</label>
                        {/* <div>
                          <TopicList
                            topics={tooltipData.topics.map((t) => ({
                              ...t,
                              selected: false,
                            }))}
                            onTopicClick={() => {}}
                          />
                        </div> */}
                        {pipe(
                          tooltipData.actors,
                          O.map((actors) => (
                            <ActorList
                              key="actors"
                              actors={actors.map((a) => ({
                                ...a,
                                selected: false,
                              }))}
                              onActorClick={() => {}}
                              avatarScale="scale1000"
                            />
                          )),
                          O.toNullable
                        )}
                      </div>
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
                  <LegendOrdinal<typeof networkProps.groupsScale>
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
            </div>
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
  return (
    ((date.getTime() - minDate.getTime()) * width) /
    (maxDate.getTime() - minDate.getTime())
  );
};

const getY = (
  topics: Array<{ id: string }>,
  margin: number,
  height: number
) => (key: string) =>
  pipe(
    topics,
    A.findIndex((t) => Eq.eqString.equals(t.id, key)),
    O.fold(
      () => 0,
      (index) => {
        return margin + index * ((height - margin * 2) / topics.length);
      }
    )
  );

const updateMap = <F extends Common.BaseFrontmatter>(acc: Map<string, F>) => (
  frontmatters: F[]
): Map<string, F> => {
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

const getLinks = (
  nodes: Array<NetworkPointNode<EventNetworkDatum>>,
  relationLinks: Map<string, NetworkLink[]>
) => (
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

export interface NetworkTemplateData {
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

export interface NetworkTemplateProps {
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

type GroupByItem = Actor.Actor | Group.Group;

export function createNetworkTemplateProps({
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
}: EventsNetworkProps & {
  width: number;
  height: number;
  margin: { vertical: number; horizontal: number };
}): NetworkTemplateProps {
  const orderedEvents = pipe(events, A.sort(Ord.getDualOrd(ordEventDate)));

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

  const networkWidth = differenceInDays(maxDate, minDate) * 5;

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

      // console.log({ eventDate: e.frontmatter.date, minDate, maxDate })
      const isBetweenDateRange = Ord.between(Ord.ordDate)(minDate, maxDate)(
        eventDate(e)
      );
      // console.log({isBetweenDateRange, networkWidth})

      if (isBetweenDateRange) {
        const groupByEventList =
          groupBy === "group"
            ? allGroups.filter((g) => e.groups.includes(g.id))
            : allActors.filter((a) => e.actors.includes(a.id));
        const groupByAllList = groupBy === "group" ? allGroups : allActors;
        const eventNodes: Array<NetworkPointNode<EventNetworkDatum>> = pipe(
          groupByEventList,
          A.map((groupByItem: GroupByItem) =>
            pipe(
              groupByAllList,
              A.findFirst((item: GroupByItem) => item.id === groupByItem.id)
            )
          ),
          A.compact,
          A.map((groupByItem) => ({
            x:
              margin.horizontal +
              getX(
                eventDate(e),
                minDate,
                maxDate,
                networkWidth - margin.horizontal * 2
              ),
            y: yGetter(groupByItem.id),
            data: {
              ...e,
              date: eventDate(e),
              groupBy: [groupByItem],
              actors: pipe(
                e.actors,
                O.fromPredicate((items) => items.length > 0),
                O.map((acts) => allActors.filter((a) => acts.includes(a.id)))
              ),
              label: e.title,
              color: groupByItem.color,
              innerColor: groupByItem.color,
              outerColor: groupByItem.color,
            },
          }))
        );

        const hasActor = pipe(
          e.actors,
          O.fromPredicate((items) => items.length > 0),
          O.map((acts) => allActors.filter((a) => acts.includes(a.id))),
          O.map((actors) =>
            actors.some((i) => selectedActorIds.includes(i.id))
          ),
          O.getOrElse(() => false)
        );

        const hasGroup = pipe(
          e.groups,
          O.fromPredicate((items) => items.length > 0),
          O.map((els) =>
            allGroups.some((i) => selectedGroupIds.includes(i.id))
          ),
          O.getOrElse(() => false)
        );

        const hasGroupBy = groupByEventList.some((i: { id: string }) =>
          selectedTopicIds.includes(i.id)
        );

        const groupByItems = updateMap(acc.groupByItems)(groupByEventList);

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

        if (hasActor || hasGroupBy || hasGroup) {
          const groupByLinks = pipe(
            groupByEventList,
            A.filter<Actor.Actor | Group.Group>((groupByItem) =>
              groupBy === "group"
                ? selectedGroupIds.includes(groupByItem.id)
                : selectedActorIds.includes(groupByItem.id)
            ),
            (items) => {
              const emptyMap: Map<string, NetworkLink[]> = Map.empty;
              return pipe(
                items.map((item) =>
                  getLinks(
                    eventNodes.filter(
                      (e) =>
                        e.data.groupBy.findIndex((tt) => tt.id === item.id) ===
                        0
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
                            (links) =>
                              Map.insertAt(Eq.eqString)(key, links)(acc)
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
            e.actors,
            O.fromPredicate((items) => items.length > 0),
            O.map((actIds) => allActors.filter((a) => actIds.includes(a.id))),
            O.getOrElse((): Actor.Actor[] => []),
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

        return {
          ...acc,
          groupByItems,
          actors,
          groups,
          eventNodes: [...acc.eventNodes, ...eventNodes],
        };
      }
      return acc;
    })
  );

  const groupByArray: NEA.NonEmptyArray<GroupByItem> = Map.toArray(
    Ord.ordString
  )(groupByItems).flatMap(([_k, items]) => items) as any;

  const groupByScale = ordinalScale({
    domain: groupByArray.map((t) =>
      t.type === "GroupFrontmatter" ? t.name : t.username
    ),
    range: groupByArray.map((t) => t.color),
  });

  const actorsArray = Map.toArray(Ord.ordString)(actors).flatMap(
    ([_k, actors]) => actors
  );
  const actorsScale = ordinalScale({
    domain: actorsArray.map((a) => a.fullName),
    range: actorsArray.map((a) => a.color),
  });

  const groupsArray = Map.toArray(Ord.ordString)(groups).flatMap(
    ([_k, groups]) => groups
  );
  const groupsScale = ordinalScale({
    domain: groupsArray.map((g) => g.name),
    range: groupsArray.map((a) => a.color),
  });

  const actorLinksList = Map.toArray(Ord.ordString)(actorLinks).flatMap(
    ([_k, links]) => links
  );

  return {
    minDate,
    maxDate,
    scale,
    groupBy,
    graph: {
      nodes: eventNodes,
      links: [
        ...Map.toArray(Ord.ordString)(topicLinks).flatMap(
          ([_k, links]) => links
        ),
        ...actorLinksList,
        ...Map.toArray(Ord.ordString)(groupLinks).flatMap(
          ([_k, links]) => links
        ),
      ],
    },
    groupByScale,
    actorsScale,
    groupsScale,
    selectedEvents,
    width: width > networkWidth ? width : networkWidth,
    height: height,
  };
}
