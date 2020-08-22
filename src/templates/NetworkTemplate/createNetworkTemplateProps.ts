import { NetworkProps, NetworkScale } from "@components/Network/Network"
import { ActorListActor } from "@components/lists/ActorList"
import { Group } from "@components/lists/GroupList"
import { TopicListTopic } from "@components/lists/TopicList"
import { getActors } from "@helpers/actor"
import { getGroups } from "@helpers/group"
import { ImageFileNode } from "@models/Image"
import { ActorMarkdownRemark } from "@models/actor"
import { EventMarkdownRemark, EventPoint } from "@models/event"
import { GroupMarkdownRemark } from "@models/group"
import { NetworkPageContentFileNode } from "@models/networks"
import { TopicMarkdownRemark, TopicPoint } from "@models/topic"
import { ordEventFileNodeDate, ordEventPointDate } from "@utils//event"
import { Link } from "@vx/network/lib/types"
import { sequenceS } from "fp-ts/lib/Apply"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import * as t from "io-ts"
import moment from "moment"

interface NetworkLink extends Link<EventPoint> {
  fill: string
  stroke: string
}

type TopicsMap = Map<string, TopicPoint>
type TopicEventsMap = Map<string, TopicPoint & { events: EventPoint[] }>

interface ActorData {
  actor: ActorMarkdownRemark
  color: string
  events: EventPoint[]
  links: NetworkLink[]
  antiEcologicAct: number
  ecologicAct: number
  totalActs: number
}

interface GroupData {
  group: GroupMarkdownRemark
  color: string
  events: EventPoint[]
  links: NetworkLink[]
  antiEcologicAct: number
  ecologicAct: number
  totalActs: number
}

type ActorId = string
type GroupId = string

type ActorsMap = Map<ActorId, ActorData>
type GroupsMap = Map<GroupId, GroupData>

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

const getY = (topics: string[], margin: number, height: number) => (
  key: string
) => {
  const pos = topics.findIndex((t) => Eq.eqString.equals(t, key))
  if (pos > -1) {
    return margin + pos * ((height - margin * 2) / topics.length)
  }
  return 0
}

function addOneIfEqualTo(o: O.Option<string>, match: string): 0 | 1 {
  return pipe(
    o,
    O.exists((type) => Eq.eqString.equals(type, match))
  )
    ? 1
    : 0
}

function getWeek(date: Date): number {
  var onejan = new Date(date.getFullYear(), 0, 1)
  var millisecsInDay = 86400000
  return Math.ceil(
    ((date.getTime() - onejan.getTime()) / millisecsInDay +
      onejan.getDay() +
      1) /
      7
  )
}

function getMinDateByScale(
  scale: NetworkProps["scale"],
  event: EventPoint
): Date {
  if (scale === "year") {
    return new Date(event.data.frontmatter.date.getFullYear(), 0, 1)
  } else if (scale === "month") {
    return new Date(
      event.data.frontmatter.date.getFullYear(),
      event.data.frontmatter.date.getMonth(),
      1
    )
  } else if (scale === "week") {
    return moment(event.data.frontmatter.date).subtract(1, "w").toDate()
  }
  return moment(event.data.frontmatter.date).hour(0).min(0).toDate()
}

function getMaxDateByScale(
  scale: NetworkProps["scale"],
  event: EventPoint
): Date {
  if (scale === "year") {
    return new Date(event.data.frontmatter.date.getFullYear(), 11, 31)
  } else if (scale === "month") {
    return moment({
      year: event.data.frontmatter.date.getFullYear(),
      month: event.data.frontmatter.date.getMonth(),
    })
      .add(1, "month")
      .subtract(1, "day")
      .toDate()
  } else if (scale === "week") {
    return moment(event.data.frontmatter.date).add(1, "week").toDate()
  }
  return moment(event.data.frontmatter.date).hour(24).min(0).toDate()
}

interface Result {
  eventNodes: Map<string, EventPoint[]>
  eventLinks: Map<string, NetworkLink[]>
  selectedNodes: Map<string, EventPoint[]>
  topicEventsMap: TopicEventsMap
  actorsWithEventsAndLinksMap: ActorsMap
  groupsWithEventsAndLinksMap: GroupsMap
}

interface ActorResults {
  actors: Array<
    Omit<ActorData, "actor" | "events" | "links"> & {
      actor: ActorListActor
    }
  >
  events: EventPoint[]
  links: NetworkLink[]
}

interface GroupResults {
  groups: Array<
    Omit<GroupData, "group" | "events" | "links"> & {
      group: Group
    }
  >
  events: EventPoint[]
  links: NetworkLink[]
}

export interface NetworkTemplateData {
  pageContent: NetworkPageContentFileNode
  topics: {
    nodes: TopicMarkdownRemark[]
  }
  actors: {
    nodes: ActorMarkdownRemark[]
  }
  groups: {
    nodes: GroupMarkdownRemark[]
  }
  events: {
    nodes: EventMarkdownRemark[]
  }
  images: {
    nodes: ImageFileNode[]
  }
}

export interface CreateNetworkConfig {
  data: NetworkTemplateData
  selectedActorIds: string[]
  selectedGroupIds: string[]
  selectedTopicIds: string[]
  scale: NetworkScale
  scalePoint: O.Option<EventPoint>
  margin: {
    vertical: number
    horizontal: number
  }
  height: number
}

export interface NetworkTemplateProps {
  // networkName: string
  pageContent: NetworkPageContentFileNode
  minDate: Date
  maxDate: Date
  scale: NetworkScale
  graph: any
  actors: ActorListActor[]
  topics: TopicListTopic[]
  groups: Group[]
  selectedNodes: EventMarkdownRemark[]
  selectedEventsCounter: { counter: number; total: number }
  topicEventsMap: TopicEventsMap
  networkWidth: number
}

export function createNetwork({
  data,
  scale,
  scalePoint,
  selectedActorIds,
  selectedGroupIds,
  selectedTopicIds,
  height,
  // width,
  margin,
}: CreateNetworkConfig): E.Either<t.Errors, NetworkTemplateProps> {
  return pipe(
    sequenceS(E.either)({
      topics: t.array(TopicMarkdownRemark).decode(data.topics.nodes),
      actors: t.array(ActorMarkdownRemark).decode(data.actors.nodes),
      groups: t.array(GroupMarkdownRemark).decode(data.groups.nodes),
      events: t.array(EventMarkdownRemark).decode(data.events.nodes),
    }),
    E.chain(({ actors, groups, topics, events }) => {
      const yGetter = getY(
        topics.map((n) => n.frontmatter.uuid),
        margin.vertical,
        height
      )

      // create topics map
      const topicsMap = topics.reduce<TopicsMap>((acc, t, i) => {
        const topicUUID = t.frontmatter.uuid
        return Map.insertAt(Eq.eqString)(topicUUID, {
          data: {
            ...t.frontmatter,
            selected: false,
          },
          x: 0,
          y: yGetter(topicUUID),
        })(acc)
      }, Map.empty)

      // create actors map
      const actorsMap = A.reduce<ActorMarkdownRemark, ActorsMap>(
        Map.empty,
        (acc, actorNode) => {
          const value: ActorData = {
            actor: actorNode,
            events: [],
            links: [],
            antiEcologicAct: 0,
            ecologicAct: 0,
            totalActs: 0,
            color: O.getOrElse(() => "#F00")(
              actorNode.frontmatter.color
            ),
          }

          return Map.insertAt(Eq.eqString)(
            actorNode.frontmatter.uuid,
            value
          )(acc)
        }
      )(actors)

      const actorsList = Map.toArray(Ord.ordString)(actorsMap).map(
        ([_, actor]) => actor
      )

      // create groups map
      const groupsMap = A.reduce<GroupMarkdownRemark, GroupsMap>(
        Map.empty,
        (acc, group) => {
          const value: GroupData = {
            group,
            events: [],
            links: [],
            antiEcologicAct: 0,
            ecologicAct: 0,
            totalActs: 0,
            color: O.getOrElse(() => "red")(
              group.frontmatter.color
            ),
          }

          return Map.insertAt(Eq.eqString)(
            group.frontmatter.uuid,
            value
          )(acc)
        }
      )(groups)

      
      const groupsList = Map.toArray(Ord.ordString)(groupsMap).map(
        ([_, g]) => g
      )

      const props = pipe(
        E.right<t.Errors, EventMarkdownRemark[]>(events),
        E.map((events) =>
          scale === "all"
            ? events
            : pipe(
                scalePoint,
                O.map((p) => {
                  const selectedFullYear = p.data.frontmatter.date.getFullYear()
                  const selectedMonth = p.data.frontmatter.date.getMonth()
                  const selectedWeek = getWeek(p.data.frontmatter.date)
                  const selectedDate = p.data.frontmatter.date.getDate()

                  return events.filter((n) => {
                    const nodeFullYear = n.frontmatter.date.getFullYear()
                    const nodeMonth = n.frontmatter.date.getMonth()
                    const nodeWeek = getWeek(
                      n.frontmatter.date
                    )
                    const nodeDate = n.frontmatter.date.getDate()

                    if (scale === "year") {
                      return Eq.eqNumber.equals(nodeFullYear, selectedFullYear)
                    }
                    if (scale === "month") {
                      return (
                        Eq.eqNumber.equals(nodeFullYear, selectedFullYear) &&
                        Eq.eqNumber.equals(nodeMonth, selectedMonth)
                      )
                    }

                    if (scale === "week") {
                      return (
                        Eq.eqNumber.equals(nodeFullYear, selectedFullYear) &&
                        Eq.eqNumber.equals(nodeMonth, selectedMonth) &&
                        Eq.eqNumber.equals(nodeWeek, selectedWeek)
                      )
                    }

                    if (scale === "day") {
                      return (
                        Eq.eqNumber.equals(nodeFullYear, selectedFullYear) &&
                        Eq.eqNumber.equals(nodeMonth, selectedMonth) &&
                        Eq.eqNumber.equals(nodeWeek, selectedWeek) &&
                        Eq.eqNumber.equals(nodeDate, selectedDate)
                      )
                    }
                    return true
                  })
                }),
                O.getOrElse((): EventMarkdownRemark[] => [])
              )
        ),
        E.map((events) => {
          const eventsSortedByDate = pipe(
            events,
            A.sortBy([ordEventFileNodeDate])
          )

          const minDate =
            scale === "all"
              ? pipe(
                  A.head(eventsSortedByDate),
                  O.map((e) => e.frontmatter.date),
                  O.getOrElse(() => new Date("2018-01-01"))
                )
              : pipe(
                  scalePoint,
                  O.map((p) => getMinDateByScale(scale, p)),
                  O.getOrElse(() => new Date("2018-01-01"))
                )

          const maxDate =
            scale === "all"
              ? pipe(
                  A.last(eventsSortedByDate),
                  O.map((e) => e.frontmatter.date),
                  O.getOrElse(() => new Date())
                )
              : pipe(
                  scalePoint,
                  O.map((p) => getMaxDateByScale(scale, p)),
                  O.getOrElse(() => new Date())
                )

          const networkWidth = moment(maxDate).diff(moment(minDate), "days")

          const result: Result = {
            eventNodes: Map.empty,
            eventLinks: Map.empty,
            selectedNodes: Map.empty,
            actorsWithEventsAndLinksMap: Map.empty,
            groupsWithEventsAndLinksMap: Map.empty,
            topicEventsMap: pipe(
              topicsMap,
              Map.map((t) => ({
                ...t,
                events: [],
              }))
            ),
          }

          const actorsGetter = getActors(
            actorsList.map((a) => a.actor.frontmatter)
          )

          const groupsGetter = getGroups(
            groupsList.map((a) => a.group.frontmatter)
          )

          const {
            eventNodes,
            eventLinks,
            selectedNodes,
            actorsWithEventsAndLinksMap,
            groupsWithEventsAndLinksMap,
            topicEventsMap,
          } = eventsSortedByDate.reduce<Result>((acc, e) => {
            // get topic from relative directory

            const topicOpt = pipe(
              A.head(e.frontmatter.topics),
              O.chain((t) => Map.lookupWithKey(Eq.eqString)(t, topicsMap)),
              O.map(([_, topic]) => {
                return {
                  ...topic,
                  data: {
                    ...topic.data,
                    selected: A.elem(Eq.eqString)(
                      topic.data.uuid,
                      selectedTopicIds
                    ),
                  },
                }
              })
            )

            if (O.isNone(topicOpt)) {
              return acc
            }

            const topic = topicOpt.value

            const eventFrontmatterType = e.frontmatter.type

            const eventActors = pipe(
              e.frontmatter.actors,
              O.map(actorsGetter)
            )

            const eventGroups = pipe(
              e.frontmatter.groups,
              O.map(groupsGetter)
            )

            const eventPoint: EventPoint = {
              x:
                margin.horizontal +
                getX(
                  e.frontmatter.date,
                  minDate,
                  maxDate,
                  networkWidth - margin.horizontal * 2
                ),
              y: yGetter(topic.data.uuid),
              data: {
                ...e,
              },
            }

            const eventNodes = pipe(
              Map.lookup(Eq.eqString)(topic.data.uuid, acc.eventNodes),
              O.fold(
                () => [eventPoint],
                (events) => events.concat(eventPoint)
              )
            )

            const selectedNodes = topic.data.selected
              ? pipe(
                  Map.lookup(Eq.eqString)(topic.data.uuid, acc.selectedNodes),
                  O.fold(
                    () => [eventPoint],
                    (events) => events.concat(eventPoint)
                  )
                )
              : []

            const eventLinks = topic.data.selected
              ? pipe(
                  Map.lookup(Eq.eqString)(topic.data.uuid, acc.eventLinks),
                  O.fold(
                    () => [
                      {
                        source: eventPoint,
                        target: eventPoint,
                        fill: topic.data.color,
                        stroke: topic.data.color,
                      },
                    ],
                    (links) => {
                      return links.concat({
                        source: pipe(
                          A.last(links),
                          O.map((l) => l.target),
                          O.getOrElse(() => eventPoint)
                        ),
                        target: eventPoint,
                        stroke: topic.data.color,
                        fill: topic.data.color,
                      })
                    }
                  )
                )
              : []

            const actorsWithEventsAndLinksMap = pipe(
              eventActors,
              O.map((actors) => {
                return Map.toArray(Ord.ordString)(actorsMap)
                  .filter(([_, a]) =>
                    actors.find(
                      (_) =>
                        _.uuid === a.actor.frontmatter.uuid
                    )
                  )
                  .reduce<ActorsMap>((prev, [_, a]) => {
                    const actorData = pipe(
                      Map.lookup(Eq.eqString)(
                        a.actor.frontmatter.uuid,
                        prev
                      ),
                      O.fold(
                        (): ActorData => {
                          const events = A.elem(Eq.eqString)(
                            a.actor.frontmatter.uuid,
                            selectedActorIds
                          )
                            ? [eventPoint]
                            : []

                          return {
                            ...a,
                            ecologicAct: addOneIfEqualTo(
                              eventFrontmatterType,
                              "EcologicAct"
                            ),
                            antiEcologicAct: addOneIfEqualTo(
                              eventFrontmatterType,
                              "AntiEcologicAct"
                            ),
                            events: events,
                            links: [],
                            totalActs: 1,
                          }
                        },
                        (item): ActorData => {
                          const link = {
                            source: pipe(
                              A.last(item.events),
                              O.getOrElse(() => eventPoint)
                            ),
                            target: eventPoint,
                            fill: a.color,
                            stroke: a.color,
                          }

                          const events = A.elem(Eq.eqString)(
                            a.actor.frontmatter.uuid,
                            selectedActorIds
                          )
                            ? item.events.concat(eventPoint)
                            : []

                          return {
                            ...item,
                            events: events,
                            links: item.links.concat(link),
                            ecologicAct:
                              item.ecologicAct +
                              addOneIfEqualTo(
                                eventFrontmatterType,
                                "EcologicAct"
                              ),
                            antiEcologicAct:
                              item.antiEcologicAct +
                              addOneIfEqualTo(
                                eventFrontmatterType,
                                "AntiEcologicAct"
                              ),
                            totalActs: item.totalActs + 1,
                          }
                        }
                      )
                    )
                    return Map.insertAt(Eq.eqString)(
                      a.actor.frontmatter.uuid,
                      actorData
                    )(prev)
                  }, acc.actorsWithEventsAndLinksMap)
              }),
              O.getOrElse((): ActorsMap => acc.actorsWithEventsAndLinksMap)
            )


            const groupsWithEventsAndLinksMap = pipe(
              eventGroups,
              O.map((groups) => {
                
                return Map.toArray(Ord.ordString)(groupsMap)
                  .filter(([_, a]) =>
                    groups.find(
                      (_) =>
                        _.uuid === a.group.frontmatter.uuid
                    )
                  )
                  .reduce<GroupsMap>((prev, [_, a]) => {
                    const groupData = pipe(
                      Map.lookup(Eq.eqString)(
                        a.group.frontmatter.uuid,
                        prev
                      ),
                      O.fold(
                        (): GroupData => {
                          const events = A.elem(Eq.eqString)(
                            a.group.frontmatter.uuid,
                            selectedGroupIds
                          )
                            ? [eventPoint]
                            : []

                          return {
                            ...a,
                            ecologicAct: addOneIfEqualTo(
                              eventFrontmatterType,
                              "EcologicAct"
                            ),
                            antiEcologicAct: addOneIfEqualTo(
                              eventFrontmatterType,
                              "AntiEcologicAct"
                            ),
                            events: events,
                            links: [],
                            totalActs: 1,
                          }
                        },
                        (item): GroupData => {
                          const link = {
                            source: pipe(
                              A.last(item.events),
                              O.getOrElse(() => eventPoint)
                            ),
                            target: eventPoint,
                            fill: a.color,
                            stroke: a.color,
                          }

                          const events = A.elem(Eq.eqString)(
                            a.group.frontmatter.uuid,
                            selectedGroupIds
                          )
                            ? item.events.concat(eventPoint)
                            : []

                          return {
                            ...item,
                            events: events,
                            links: item.links.concat(link),
                            ecologicAct:
                              item.ecologicAct +
                              addOneIfEqualTo(
                                eventFrontmatterType,
                                "EcologicAct"
                              ),
                            antiEcologicAct:
                              item.antiEcologicAct +
                              addOneIfEqualTo(
                                eventFrontmatterType,
                                "AntiEcologicAct"
                              ),
                            totalActs: item.totalActs + 1,
                          }
                        }
                      )
                    )
                    return Map.insertAt(Eq.eqString)(
                      a.group.frontmatter.uuid,
                      groupData
                    )(prev)
                  }, acc.groupsWithEventsAndLinksMap)
              }),
              O.getOrElse((): GroupsMap => acc.groupsWithEventsAndLinksMap)
            )

            const topicEventsMap = e.frontmatter.topics.reduce(
              (topicAcc, t) => {
                return pipe(
                  Map.lookup(Eq.eqString)(t, topicAcc),
                  O.map((datum) => ({
                    ...datum,
                    events: datum.events.concat(eventPoint),
                  })),
                  O.map((d) => Map.insertAt(Eq.eqString)(t, d)(topicAcc)),
                  O.getOrElse(() => topicAcc)
                )
              },
              acc.topicEventsMap
            )

            return {
              eventNodes: Map.insertAt(Eq.eqString)(
                topic.data.uuid,
                eventNodes
              )(acc.eventNodes),
              eventLinks: Map.insertAt(Eq.eqString)(
                topic.data.uuid,
                eventLinks
              )(acc.eventLinks),
              selectedNodes: Map.insertAt(Eq.eqString)(
                topic.data.uuid,
                selectedNodes
              )(acc.selectedNodes),
              actorsWithEventsAndLinksMap,
              groupsWithEventsAndLinksMap,
              topicEventsMap,
            }
          }, result)

          const nodes = Map.toArray(Ord.ordString)(eventNodes).reduce<
            EventPoint[]
          >((acc, [_, nodes]) => acc.concat(...nodes), [])

          const links = Map.toArray(Ord.ordString)(eventLinks).reduce<
            NetworkLink[]
          >((acc, [_, links]) => acc.concat(...links), [])

          const actorResults = Map.toArray(Ord.ordString)(
            actorsWithEventsAndLinksMap
          ).reduce<ActorResults>(
            (acc, [_, value]) => {
              return {
                actors: acc.actors.concat({
                  actor: {
                    ...value.actor.frontmatter,
                    selected: A.elem(Eq.eqString)(
                      value.actor.frontmatter.uuid,
                      selectedActorIds
                    ),
                  },
                  antiEcologicAct: value.antiEcologicAct,
                  ecologicAct: value.ecologicAct,
                  totalActs: value.totalActs,
                  color: value.color,
                }),
                events: acc.events.concat(...value.events),
                links: acc.links.concat(...value.links),
              }
            },
            { actors: [], events: [], links: [] }
          )

          const groupResults = Map.toArray(Ord.ordString)(
            groupsWithEventsAndLinksMap
          ).reduce<GroupResults>(
            (acc, [_, data]) => {
              return {
                groups: acc.groups.concat({
                  group: {
                    ...data.group.frontmatter,
                    selected: A.elem(Eq.eqString)(
                      data.group.frontmatter.uuid,
                      selectedGroupIds
                    ),
                  },
                  antiEcologicAct: data.antiEcologicAct,
                  ecologicAct: data.ecologicAct,
                  totalActs: data.totalActs,
                  color: data.color,
                }),
                events: acc.events.concat(...data.events),
                links: acc.links.concat(...data.links),
              }
            },
            { groups: [], events: [], links: [] }
          )

          const selectedNodesArray: EventPoint[] = Map.toArray(Ord.ordString)(
            selectedNodes
          ).reduce<EventPoint[]>((acc, [_, nodes]) => acc.concat(...nodes), [])

          const filteredActorEvents = actorResults.events.filter(
            (e) =>
              selectedNodesArray.find(
                (s) => s.data.frontmatter.uuid === e.data.frontmatter.uuid
              ) === undefined
          )
          const filteredGroupEvents = groupResults.events.filter(
            (e) =>
              selectedNodesArray.find(
                (s) => s.data.frontmatter.uuid === e.data.frontmatter.uuid
              ) === undefined
          )

          const selectedNodesSorted = A.sortBy([
            Ord.getDualOrd(ordEventPointDate),
          ])(
            selectedNodesArray
              .concat(...filteredActorEvents)
              .concat(...filteredGroupEvents)
          )

          const selectedEventsCounter = selectedNodesSorted.reduce(
            (acc, n) =>
              acc +
              O.fold(
                () => 0,
                (t) => (t === "AntiEcologicalAct" ? -1 : 1)
              )(n.data.frontmatter.type),
            0
          )

          return {
            minDate,
            maxDate,
            scale,
            pageContent: data.pageContent,
            topics: topics.map((t) => ({
              ...t.frontmatter,
              selected: A.elem(Eq.eqString)(
                t.frontmatter.uuid,
                selectedTopicIds
              ),
            })),
            topicEventsMap,
            actors: actorsList.map((a) => ({
              ...a.actor.frontmatter,
              selected: selectedActorIds.some(
                (id) => id === a.actor.frontmatter.uuid
              ),
            })),
            groups: groupsList.map((a) => ({
              ...a.group.frontmatter,
              selected: selectedGroupIds.some(id => id === a.group.frontmatter.uuid),
            })),
            graph: {
              nodes,
              links: links.concat(...actorResults.links).concat(...groupResults.links),
            },
            selectedNodes: selectedNodesSorted.map((n) => n.data),
            selectedEventsCounter: {
              counter: selectedEventsCounter,
              total: selectedNodesSorted.length,
            },
            networkWidth,
          }
        })
      )

      return props
    }),
    E.map((p) => ({
      ...p,
      pageContent: data.pageContent,
    }))
  )
}
