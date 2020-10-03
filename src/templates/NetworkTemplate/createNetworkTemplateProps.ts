import { NetworkScale } from "@components/graph/Network/Network"
import { Frontmatter } from "@models/Frontmatter"
import { ActorFrontmatter, ActorMarkdownRemark } from "@models/actor"
import { EventMarkdownRemark, EventPoint } from "@models/event"
import { GroupFrontmatter, GroupMarkdownRemark } from "@models/group"
import { NetworkPageMarkdownRemark } from "@models/networks"
import { TopicFrontmatter, TopicMarkdownRemark } from "@models/topic"
import { ordEventData } from "@utils//event"
import { eqByUUID } from "@utils/frontmatter"
import { ScaleOrdinal } from "@vx/legend/lib/types"
import { Link } from "@vx/network/lib/types"
import ordinalScale from "@vx/scale/lib/scales/ordinal"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as NEA from "fp-ts/lib/NonEmptyArray"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import * as t from "io-ts"
import moment from "moment"

interface NetworkLink extends Link<EventPoint> {
  fill: string
  stroke: string
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

const getLinks = (nodes: EventPoint[], relationLinks: Map<string, NetworkLink[]>) => (
  relations: Array<Frontmatter & { color: string }>
): Map<string, NetworkLink[]> => {
  return pipe(
    nodes,
    A.reduce(relationLinks, (acc, p) => {
      const newLinks = pipe(
        relations,
        A.reduce(acc, (acc1, relation) => {
          const lastLinks = pipe(
            Map.lookup(Ord.ordString)(relation.uuid, acc1)  ,
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
  eventNodes: EventPoint[]
  topicLinks: Map<string, NetworkLink[]>
  actorLinks: Map<string, NetworkLink[]>
  groupLinks: Map<string, NetworkLink[]>
  selectedEvents: EventMarkdownRemark[]
  topics: Map<string, TopicFrontmatter>
  actors: Map<string, ActorFrontmatter>
  groups: Map<string, GroupFrontmatter>
}

export interface NetworkTemplateData {
  pageContent: NetworkPageMarkdownRemark
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
}

export interface CreateNetworkConfig {
  data: {
    events: {
      nodes: unknown[]
    }
  }
  minDate: O.Option<Date>
  maxDate: O.Option<Date>
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
  width: number
}

export interface NetworkTemplateProps {
  minDate: Date
  maxDate: Date
  scale: NetworkScale
  graph: { nodes: EventPoint[]; links: NetworkLink[] }
  selectedEvents: EventMarkdownRemark[]
  width: number
  height: number
  topicsScale: ScaleOrdinal<string, string>
  actorsScale: ScaleOrdinal<string, string>
  groupsScale: ScaleOrdinal<string, string>
}

export function createNetworkTemplateProps({
  data,
  minDate: minDateOpt,
  maxDate: maxDateOpt,
  scale,
  scalePoint,
  selectedActorIds,
  selectedGroupIds,
  selectedTopicIds,
  height,
  width,
  margin,
}: CreateNetworkConfig): E.Either<t.Errors, NetworkTemplateProps> {
  return pipe(
    t.array(EventMarkdownRemark).decode(data.events.nodes),
    E.chain((events) => {
      const orderedEvents = pipe(events, A.sort(Ord.getDualOrd(ordEventData)))
      const eventMinDate = pipe(
        A.last(orderedEvents),
        O.map((e) => e.frontmatter.date)
      )

      const minDate = pipe(
        minDateOpt,
        O.alt(() => eventMinDate),
        O.getOrElse(() => moment().subtract(1, "week").toDate())
      )

      const eventMaxDate = pipe(
        A.head(orderedEvents),
        O.map((e) => e.frontmatter.date)
      )
      const maxDate = pipe(
        maxDateOpt,
        O.alt(() => eventMaxDate),
        O.getOrElse(() => new Date())
      )

      const networkWidth = moment(maxDate).diff(moment(minDate), "days") * 5

      const topics = orderedEvents.reduce<TopicFrontmatter[]>(
        (acc, e) => [
          ...acc,
          ...e.frontmatter.topics.filter(
            (t) => !acc.some((i) => Eq.eqString.equals(i.uuid, t.uuid))
          ),
        ],
        []
      )

      const yGetter = getY(topics, margin.vertical, height)

      const props = pipe(
        E.right<t.Errors, EventMarkdownRemark[]>(orderedEvents),
        E.map((events) => {
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

              const eventDate = moment(e.frontmatter.date)
              const isBetweenDateRange =
                eventDate.isSameOrAfter(minDate) &&
                eventDate.isSameOrBefore(maxDate)

              if (isBetweenDateRange) {
                const eventNodes: EventPoint[] = pipe(
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
                      ...e,
                      frontmatter: {
                        ...e.frontmatter,
                        topics: [t],
                      },
                    },
                    color: t.color,
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
                            eventNodes.filter((e) =>
                              e.data.frontmatter.topics.findIndex(
                                (tt) => tt.uuid === t.uuid
                              ) === 0
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
                                    O.map((accLinks) => [
                                      ...accLinks,
                                      ...mapLinks,
                                    ]),
                                    O.getOrElse(() => mapLinks),
                                    (links) =>
                                      Map.insertAt(Eq.eqString)(key, links)(acc)
                                  )
                                ),
                                O.getOrElse(
                                  (): Map<string, NetworkLink[]> => acc
                                )
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
                    getLinks(eventNodes, acc.actorLinks),
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
            height: height
          }
        })
      )

      return props
    })
  )
}
