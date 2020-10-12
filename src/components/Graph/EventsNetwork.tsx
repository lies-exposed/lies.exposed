import Network, { NetworkScale } from "@components/Common/Graph/Network/Network"
import {
  NetworkNodeDatum,
  NetworkPointNode,
} from "@components/Common/Graph/Network/NetworkNode"
import ActorList from "@components/lists/ActorList"
import TopicList from "@components/lists/TopicList"
import { Frontmatter } from "@models/Frontmatter"
import { ActorFrontmatter, ActorMD } from "@models/actor"
import { EventMD } from "@models/event"
import { GroupFrontmatter, GroupMdx } from "@models/group"
import { NetworkPageMD } from "@models/networks"
import { TopicFrontmatter, TopicMD } from "@models/topic"
import { ordEventDate } from "@utils//event"
import { formatDate } from "@utils/date"
import { eqByUUID } from "@utils/frontmatter"
import { LegendItem, LegendLabel, LegendOrdinal } from "@vx/legend"
import { Link } from "@vx/network/lib/types"
import ParentSize from "@vx/responsive/lib/components/ParentSize"
import ordinalScale from "@vx/scale/lib/scales/ordinal"
import { LabelMedium, LabelSmall } from "baseui/typography"
import { ScaleOrdinal } from "d3"
import { subWeeks } from "date-fns"
import { differenceInDays } from "date-fns/esm"
import * as A from "fp-ts/lib/Array"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as NEA from "fp-ts/lib/NonEmptyArray"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

interface EventNetworkDatum extends NetworkNodeDatum {
  title: string
  date: Date
  topics: NEA.NonEmptyArray<TopicFrontmatter>
  actors: O.Option<ActorFrontmatter[]>
}

interface NetworkLink extends Link<NetworkPointNode<EventNetworkDatum>> {
  fill: string
  stroke: string
}

export interface EventsNetworkProps {
  events: EventMD[]
  selectedActorIds: string[]
  selectedGroupIds: string[]
  selectedTopicIds: string[]
  scale: NetworkScale
  scalePoint: O.Option<NetworkPointNode<EventNetworkDatum>>
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
            margin: { vertical: 40, horizontal: 40 }
          })
          return (
            <div>
              <Network<NetworkLink, EventNetworkDatum>
                onDoubleClick={() => {}}
                onNodeClick={() => {}}
                onEventLabelClick={() => {}}
                tooltipRenderer={(tooltipData) => {
                  return (
                    <div>
                      <LabelMedium>{tooltipData.title}</LabelMedium>
                      <LabelSmall>
                        Data: {formatDate(tooltipData.date)}
                      </LabelSmall>
                      <div>
                        <TopicList
                          topics={tooltipData.topics.map((t) => ({
                            ...t,
                            selected: false,
                          }))}
                          onTopicClick={() => {}}
                        />
                      </div>
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
                  )
                }}
                {...networkProps}
              />
              <div className="legends">
                <LegendDemo title="Topics">
                  <LegendOrdinal
                    scale={networkProps.topicsScale}
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
                      )
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
                      )
                    }}
                  </LegendOrdinal>
                </LegendDemo>
                <LegendDemo title="Groups">
                  <LegendOrdinal<typeof networkProps.groupsScale>
                    scale={networkProps.groupsScale}
                    labelFormat={(datum) => {
                      return datum
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
                      )
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
          )
        }}
      </ParentSize>
    </>
  )
}

function LegendDemo({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
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
  )
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
  )
}

const getY = (topics: TopicFrontmatter[], margin: number, height: number) => (
  key: string
) =>
  pipe(
    topics,
    A.findIndex((t) => Eq.eqString.equals(t.uuid, key)),
    O.fold(
      () => 0,
      (index) => {
        return margin + index * ((height - margin * 2) / topics.length)
      }
    )
  )

const updateMap = <F extends Frontmatter>(acc: Map<string, F>) => (
  frontmatters: F[]
): Map<string, F> => {
  return pipe(
    frontmatters,
    A.reduce(acc, (r, t) => {
      if (Map.elem(eqByUUID)(t, r)) {
        return r
      }
      return Map.insertAt(Eq.eqString)(t.uuid, t)(r)
    })
  )
}

const getLinks = (
  nodes: Array<NetworkPointNode<EventNetworkDatum>>,
  relationLinks: Map<string, NetworkLink[]>
) => (
  relations: Array<Frontmatter & { color: string }>
): Map<string, NetworkLink[]> => {
  return pipe(
    nodes,
    A.reduce(relationLinks, (acc, p) => {
      const newLinks = pipe(
        relations,
        A.reduce(acc, (acc1, relation) => {
          const lastLinks = pipe(
            Map.lookup(Ord.ordString)(relation.uuid, acc1),
            O.getOrElse((): NetworkLink[] => [])
          )

          return pipe(
            acc1,
            Map.insertAt(Eq.eqString)(relation.uuid, [
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
          )
        })
      )
      return newLinks
    })
  )
}

interface Result {
  eventNodes: Array<NetworkPointNode<EventNetworkDatum>>
  topicLinks: Map<string, NetworkLink[]>
  actorLinks: Map<string, NetworkLink[]>
  groupLinks: Map<string, NetworkLink[]>
  selectedEvents: EventMD[]
  topics: Map<string, TopicFrontmatter>
  actors: Map<string, ActorFrontmatter>
  groups: Map<string, GroupFrontmatter>
}

export interface NetworkTemplateData {
  pageContent: NetworkPageMD
  topics: {
    nodes: TopicMD[]
  }
  actors: {
    nodes: ActorMD[]
  }
  groups: {
    nodes: GroupMdx[]
  }
  events: {
    nodes: EventMD[]
  }
}

export interface NetworkTemplateProps {
  minDate: Date
  maxDate: Date
  scale: NetworkScale
  graph: {
    nodes: Array<NetworkPointNode<EventNetworkDatum>>
    links: NetworkLink[]
  }
  selectedEvents: EventMD[]
  width: number
  height: number
  topicsScale: ScaleOrdinal<string, string>
  actorsScale: ScaleOrdinal<string, string>
  groupsScale: ScaleOrdinal<string, string>
}

export function createNetworkTemplateProps({
  events,
  scale,
  scalePoint,
  selectedActorIds,
  selectedGroupIds,
  selectedTopicIds,
  height,
  width,
  margin
}: EventsNetworkProps & {
  width: number
  height: number
  margin: { vertical: number; horizontal: number }
}): NetworkTemplateProps {
  const orderedEvents = pipe(events, A.sort(Ord.getDualOrd(ordEventDate)))

  const minDate = pipe(
    A.last(orderedEvents),
    O.map((e) => e.frontmatter.date),
    O.getOrElse(() => subWeeks(new Date(), 1))
  )

  const maxDate = pipe(
    A.head(orderedEvents),
    O.map((e) => e.frontmatter.date),
    O.getOrElse(() => new Date())
  )

  const networkWidth = differenceInDays(maxDate, minDate) * 5

  const topicsList = orderedEvents.reduce<TopicFrontmatter[]>(
    (acc, e) => [
      ...acc,
      ...e.frontmatter.topics.filter(
        (t) => !acc.some((i) => Eq.eqString.equals(i.uuid, t.uuid))
      ),
    ],
    []
  )

  const yGetter = getY(topicsList, margin.vertical, height)

  const result: Result = {
    eventNodes: [],
    topicLinks: Map.empty,
    actorLinks: Map.empty,
    groupLinks: Map.empty,
    topics: Map.empty,
    actors: Map.empty,
    groups: Map.empty,
    selectedEvents: [],
  }

  const {
    eventNodes,
    selectedEvents,
    topicLinks,
    actorLinks,
    groupLinks,
    topics,
    actors,
    groups,
  } = pipe(
    events,
    A.reduce(result, (acc, e) => {
      // get topic from relative directory

      // console.log({ eventDate: e.frontmatter.date, minDate, maxDate })
      const isBetweenDateRange = Ord.between(Ord.ordDate)(minDate, maxDate)(
        e.frontmatter.date
      )
      // console.log({isBetweenDateRange, networkWidth})

      if (isBetweenDateRange) {
        const eventNodes: NEA.NonEmptyArray<NetworkPointNode<
          EventNetworkDatum
        >> = pipe(
          e.frontmatter.topics,
          NEA.map((t) => ({
            x:
              margin.horizontal +
              getX(
                e.frontmatter.date,
                minDate,
                maxDate,
                networkWidth - margin.horizontal * 2
              ),
            y: yGetter(t.uuid),
            data: {
              ...e.frontmatter,
              label: e.frontmatter.title,
              color: t.color,
              topics: [t],
              innerColor: t.color,
              outerColor: t.color,
            },
          }))
        )

        const hasActor = pipe(
          e.frontmatter.actors,
          O.map((actors) =>
            actors.some((i) => selectedActorIds.includes(i.uuid))
          ),
          O.getOrElse(() => false)
        )

        const hasGroup = pipe(
          e.frontmatter.groups,
          O.map((actors) =>
            actors.some((i) => selectedGroupIds.includes(i.uuid))
          ),
          O.getOrElse(() => false)
        )

        const hasTopic = pipe(
          O.some(e.frontmatter.topics),
          O.map((topics) =>
            topics.some((i) => selectedTopicIds.includes(i.uuid))
          ),
          O.getOrElse(() => false)
        )

        const topics = pipe(e.frontmatter.topics, updateMap(acc.topics))

        const actors = pipe(
          e.frontmatter.actors,
          O.getOrElse((): ActorFrontmatter[] => []),
          updateMap(acc.actors)
        )

        const groups = pipe(
          e.frontmatter.groups,
          O.getOrElse((): GroupFrontmatter[] => []),
          updateMap(acc.groups)
        )

        if (hasActor || hasTopic || hasGroup) {
          const topicLinks = pipe(
            e.frontmatter.topics,
            A.filter((t) => selectedTopicIds.includes(t.uuid)),
            (topics) => {
              const emptyMap: Map<string, NetworkLink[]> = Map.empty
              return pipe(
                topics.map((t) =>
                  getLinks(
                    eventNodes.filter(
                      (e) =>
                        e.data.topics.findIndex((tt) => tt.uuid === t.uuid) ===
                        0
                    ),
                    acc.topicLinks
                  )([t])
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
                      )
                    })
                  )
                })
              )
            }
          )

          const actorLinks = pipe(
            e.frontmatter.actors,
            O.getOrElse((): ActorFrontmatter[] => []),
            A.filter((a) => selectedActorIds.includes(a.uuid)),
            getLinks(eventNodes, acc.actorLinks)
          )

          const groupLinks = pipe(
            e.frontmatter.groups,
            O.getOrElse((): GroupFrontmatter[] => []),
            A.filter((a) => selectedGroupIds.includes(a.uuid)),
            getLinks(eventNodes, acc.groupLinks)
          )

          return {
            eventNodes: [...acc.eventNodes, ...eventNodes],
            actorLinks,
            topicLinks,
            groupLinks,
            topics,
            actors,
            groups,
            selectedEvents: [...acc.selectedEvents, e],
          }
        }

        return {
          ...acc,
          topics,
          actors,
          groups,
          eventNodes: [...acc.eventNodes, ...eventNodes],
        }
      }
      return acc
    })
  )

  const topicsArray = Map.toArray(Ord.ordString)(topics).flatMap(
    ([_k, topics]) => topics
  )

  const topicsScale = ordinalScale({
    domain: topicsArray.map((t) => t.label),
    range: topicsArray.map((t) => t.color),
  })

  const actorsArray = Map.toArray(Ord.ordString)(actors).flatMap(
    ([_k, actors]) => actors
  )
  const actorsScale = ordinalScale({
    domain: actorsArray.map((a) => a.fullName),
    range: actorsArray.map((a) => a.color),
  })

  const groupsArray = Map.toArray(Ord.ordString)(groups).flatMap(
    ([_k, groups]) => groups
  )
  const groupsScale = ordinalScale({
    domain: groupsArray.map((g) => g.name),
    range: groupsArray.map((a) => a.color),
  })

  const actorLinksList = Map.toArray(Ord.ordString)(actorLinks).flatMap(
    ([_k, links]) => links
  )

  return {
    minDate,
    maxDate,
    scale,
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
    topicsScale,
    actorsScale,
    groupsScale,
    selectedEvents,
    width: width > networkWidth ? width : networkWidth,
    height: height,
  }
}
