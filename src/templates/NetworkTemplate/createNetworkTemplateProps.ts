import { ActorListActor } from "@components/ActorList"
import { NetworkProps, NetworkScale } from "@components/Network/Network"
import { TopicListTopic } from "@components/TopicList"
import { getActors } from "@helpers/actor"
import { getTopics } from "@helpers/topic"
import { ActorPageContentFileNode } from "@models/actor"
import { EventPoint, EventFileNode, EventData } from "@models/event"
import { ImageFileNode } from "@models/image"
import { NetworkPageContentFileNode } from "@models/networks"
import { TopicPoint, TopicFileNode } from "@models/topic"
import { ordEventFileNodeDate, ordEventPointDate } from "@utils//event"
import { Link } from "@vx/network/lib/types"
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

interface ActorData {
  actor: ActorPageContentFileNode
  color: string
  events: EventPoint[]
  links: NetworkLink[]
  antiEcologicAct: number
  ecologicAct: number
  totalActs: number
}

type ActorId = string

type ActorsMap = Map<ActorId, ActorData>

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
  const pos = topics.findIndex(t => Eq.eqString.equals(t, key))
  if (pos > -1) {
    return margin + pos * ((height - margin * 2) / topics.length)
  }
  return 0
}

function addOneIfEqualTo(o: O.Option<string>, match: string): 0 | 1 {
  return pipe(
    o,
    O.exists(type => Eq.eqString.equals(type, match))
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
    return moment(event.data.frontmatter.date)
      .subtract(1, "w")
      .toDate()
  }
  return moment(event.data.frontmatter.date)
    .hour(0)
    .min(0)
    .toDate()
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
    return moment(event.data.frontmatter.date)
      .add(1, "week")
      .toDate()
  }
  return moment(event.data.frontmatter.date)
    .hour(24)
    .min(0)
    .toDate()
}

interface Result {
  eventNodes: Map<string, EventPoint[]>
  eventLinks: Map<string, NetworkLink[]>
  selectedNodes: Map<string, EventPoint[]>
  actorsWithEventsAndLinksMap: ActorsMap
}

interface ActorsResults {
  actors: Array<
    Omit<ActorData, "actor" | "events" | "links"> & {
      actor: ActorListActor
    }
  >
  events: EventPoint[]
  links: NetworkLink[]
}

export interface NetworkTemplateData {
  pageContent: NetworkPageContentFileNode
  topics: {
    nodes: TopicFileNode[]
  }
  actorsImages: {
    nodes: ImageFileNode[]
  }
  actors: {
    nodes: ActorPageContentFileNode[]
  }
  events: {
    nodes: EventFileNode[]
  }
  images: {
    nodes: ImageFileNode[]
  }
}

export interface CreateNetworkConfig {
  data: NetworkTemplateData
  selectedActorIds: string[]
  selectedTopicIds: string[]
  scale: NetworkScale
  scalePoint: O.Option<EventPoint>
  margin: {
    vertical: number
    horizontal: number
  }
  height: number
  width: number
  colors: {
    topics: string[]
    actors: string[]
  }
}

export interface NetworkTemplateProps {
  networkName: string
  pageContent: NetworkPageContentFileNode
  minDate: Date
  maxDate: Date
  scale: NetworkScale
  graph: any
  actors: ActorsResults["actors"]
  topics: TopicListTopic[]
  selectedNodes: EventData[]
  selectedEventsCounter: { counter: number; total: number }
}

export function createNetwork({
  data,
  scale,
  scalePoint,
  selectedActorIds,
  selectedTopicIds,
  height,
  width,
  margin,
  colors,
}: CreateNetworkConfig): E.Either<t.Errors, NetworkTemplateProps> {
  const networkName = A.takeRight(1)(
    data.pageContent.relativeDirectory.split("/")
  )[0]

  const yGetter = getY(
    data.topics.nodes.map(n => n.childMarkdownRemark.frontmatter.slug),
    margin.vertical,
    height
  )

  // create a topics map
  const topicsMap = data.topics.nodes.reduce<TopicsMap>((acc, t, i) => {
    return Map.insertAt(Eq.eqString)(t.childMarkdownRemark.frontmatter.slug, {
      data: {
        ...t.childMarkdownRemark.frontmatter,
        selected: false,
      },
      x: 0,
      y: yGetter(t.childMarkdownRemark.frontmatter.slug),
    })(acc)
  }, Map.empty)

  const actorsMap = A.zip(data.actors.nodes, colors.actors).reduce<ActorsMap>(
    (acc, [actor, color]) => {
      const value: ActorData = {
        actor,
        color,
        events: [],
        links: [],
        antiEcologicAct: 0,
        ecologicAct: 0,
        totalActs: 0,
      }

      return Map.insertAt(Eq.eqString)(actor.id, value)(acc)
    },
    Map.empty
  )

  const actorsList = Map.toArray(Ord.ordString)(actorsMap).map(
    ([_, actor]) => actor
  )

  const props = pipe(
    t.array(EventFileNode).decode(data.events.nodes),
    E.map(events =>
      scale === "all"
        ? events
        : pipe(
            scalePoint,
            O.map(p => {
              const selectedFullYear = p.data.frontmatter.date.getFullYear()
              const selectedMonth = p.data.frontmatter.date.getMonth()
              const selectedWeek = getWeek(p.data.frontmatter.date)
              const selectedDate = p.data.frontmatter.date.getDate()
              return events.filter(n => {
                const nodeFullYear = n.childMarkdownRemark.frontmatter.date.getFullYear()
                const nodeMonth = n.childMarkdownRemark.frontmatter.date.getMonth()
                const nodeWeek = getWeek(n.childMarkdownRemark.frontmatter.date)
                const nodeDate = n.childMarkdownRemark.frontmatter.date.getDate()

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
            O.getOrElse((): EventFileNode[] => [])
          )
    ),
    E.map(events => {
      const eventsSortedByDate = pipe(events, A.sortBy([ordEventFileNodeDate]))

      const minDate =
        scale === "all"
          ? pipe(
              A.head(eventsSortedByDate),
              O.map(e => e.childMarkdownRemark.frontmatter.date),
              O.getOrElse(() => new Date("2018-01-01"))
            )
          : pipe(
              scalePoint,
              O.map(p => getMinDateByScale(scale, p)),
              O.getOrElse(() => new Date("2018-01-01"))
            )

      const maxDate =
        scale === "all"
          ? pipe(
              A.last(eventsSortedByDate),
              O.map(e => e.childMarkdownRemark.frontmatter.date),
              O.getOrElse(() => new Date())
            )
          : pipe(
              scalePoint,
              O.map(p => getMaxDateByScale(scale, p)),
              O.getOrElse(() => new Date())
            )

      const result: Result = {
        eventNodes: Map.empty,
        eventLinks: Map.empty,
        selectedNodes: Map.empty,
        actorsWithEventsAndLinksMap: Map.empty,
      }

      const actorsGetter = getActors(
        actorsList.map(a => a.actor.childMarkdownRemark.frontmatter)
      )

      const {
        eventNodes,
        eventLinks,
        selectedNodes,
        actorsWithEventsAndLinksMap,
      } = eventsSortedByDate.reduce<Result>((acc, e) => {
        // get topic from relative directory

        const topicOpt = pipe(
          A.head(A.takeRight(1)(e.relativeDirectory.split("/"))),
          O.mapNullable(t => {
            return Map.toArray(Ord.ordString)(topicsMap).find(
              ([_, value]) => value.data.slug === t
            )
          }),
          O.map(([_, topic]) => {
            return {
              ...topic,
              data: {
                ...topic.data,
                selected: A.elem(Eq.eqString)(
                  topic.data.slug,
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

        const cover = pipe(e.childMarkdownRemark.frontmatter.cover)

        const eventFrontmatterType = O.fromNullable(
          e.childMarkdownRemark.frontmatter.type
        )

        const eventActors = pipe(
          e.childMarkdownRemark.frontmatter.actors,
          O.map(actorsGetter)
        )

        const eventFrontmatterLinks = O.fromNullable(
          e.childMarkdownRemark.frontmatter.links
        )

        const eventPoint: EventPoint = {
          x:
            margin.horizontal +
            getX(
              e.childMarkdownRemark.frontmatter.date,
              minDate,
              maxDate,
              width - margin.horizontal * 2
            ),
          y: yGetter(topic.data.slug),
          data: {
            ...e.childMarkdownRemark,
            frontmatter: {
              ...e.childMarkdownRemark.frontmatter,
              topic: getTopics(
                e.childMarkdownRemark.frontmatter.topic,
                topics.map(t => t.data)
              ),
              type: eventFrontmatterType,
              links: eventFrontmatterLinks,
              actors: eventActors,
              cover,
            },
          },
        }

        const eventNodes = pipe(
          Map.lookup(Eq.eqString)(topic.data.slug, acc.eventNodes),
          O.fold(
            () => [eventPoint],
            events => events.concat(eventPoint)
          )
        )

        const selectedNodes = topic.data.selected
          ? pipe(
              Map.lookup(Eq.eqString)(topic.data.slug, acc.selectedNodes),
              O.fold(
                () => [eventPoint],
                events => events.concat(eventPoint)
              )
            )
          : []

        const eventLinks = topic.data.selected
          ? pipe(
              Map.lookup(Eq.eqString)(topic.data.slug, acc.eventLinks),
              O.fold(
                () => [
                  {
                    source: eventPoint,
                    target: eventPoint,
                    fill: topic.data.color,
                    stroke: topic.data.color,
                  },
                ],
                links => {
                  return links.concat({
                    source: pipe(
                      A.last(links),
                      O.map(l => l.target),
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
          O.map(actors => {
            return Map.toArray(Ord.ordString)(actorsMap)
              .filter(([_, a]) =>
                actors.find(
                  _ =>
                    _.username ===
                    a.actor.childMarkdownRemark.frontmatter.username
                )
              )
              .reduce<ActorsMap>((prev, [_, a]) => {
                const actorData = pipe(
                  Map.lookup(Eq.eqString)(a.actor.id, prev),
                  O.fold(
                    (): ActorData => {
                      const events = A.elem(Eq.eqString)(
                        a.actor.id,
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
                        a.actor.id,
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
                          addOneIfEqualTo(eventFrontmatterType, "EcologicAct"),
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
                return Map.insertAt(Eq.eqString)(a.actor.id, actorData)(prev)
              }, acc.actorsWithEventsAndLinksMap)
          }),
          O.getOrElse((): ActorsMap => acc.actorsWithEventsAndLinksMap)
        )

        return {
          eventNodes: Map.insertAt(Eq.eqString)(topic.data.slug, eventNodes)(
            acc.eventNodes
          ),
          eventLinks: Map.insertAt(Eq.eqString)(topic.data.slug, eventLinks)(
            acc.eventLinks
          ),
          selectedNodes: Map.insertAt(Eq.eqString)(
            topic.data.slug,
            selectedNodes
          )(acc.selectedNodes),
          actorsWithEventsAndLinksMap: actorsWithEventsAndLinksMap,
        }
      }, result)

      const topics = Map.toArray(Ord.ordString)(topicsMap).map(([_, t]) => t)

      const nodes = Map.toArray(Ord.ordString)(eventNodes).reduce<EventPoint[]>(
        (acc, [_, nodes]) => acc.concat(...nodes),
        []
      )

      const links = Map.toArray(Ord.ordString)(eventLinks).reduce<
        NetworkLink[]
      >((acc, [_, links]) => acc.concat(...links), [])

      const actorResults = Map.toArray(Ord.ordString)(
        actorsWithEventsAndLinksMap
      ).reduce<ActorsResults>(
        (acc, [_, value]) => {
          return {
            actors: acc.actors.concat({
              actor: {
                ...value.actor.childMarkdownRemark.frontmatter,
                selected: A.elem(Eq.eqString)(value.actor.id, selectedActorIds),
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

      const selectedNodesArray: EventPoint[] = Map.toArray(Ord.ordString)(
        selectedNodes
      ).reduce<EventPoint[]>((acc, [_, nodes]) => acc.concat(...nodes), [])

      const filteredActorEvents = actorResults.events.filter(
        e => selectedNodesArray.find(s => s.data.id === e.data.id) === undefined
      )

      const selectedNodesSorted = A.sortBy([Ord.getDualOrd(ordEventPointDate)])(
        selectedNodesArray.concat(...filteredActorEvents)
      )

      const selectedEventsCounter = selectedNodesSorted.reduce(
        (acc, n) =>
          acc +
          O.fold(
            () => 0,
            t => (t === "AntiEcologicalAct" ? -1 : 1)
          )(n.data.frontmatter.type),
        0
      )

      return {
        minDate,
        maxDate,
        scale,
        pageContent: data.pageContent,
        topics: topics.map(t => ({
          ...t.data,
          selected: A.elem(Eq.eqString)(t.data.slug, selectedTopicIds),
        })),
        actors: actorResults.actors,
        graph: {
          nodes,
          links: links.concat(...actorResults.links),
        },
        selectedNodes: selectedNodesSorted.map(n => n.data),
        selectedEventsCounter: {
          counter: selectedEventsCounter,
          total: selectedNodesSorted.length,
        },
      }
    })
  )

  return pipe(
    props,
    E.map(p => ({
      ...p,
      pageContent: data.pageContent,
      networkName,
    }))
  )
}
