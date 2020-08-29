import { NetworkScale } from "@components/Network/Network"
import { ActorFrontmatter, ActorMarkdownRemark } from "@models/actor"
import { EventMarkdownRemark, EventPoint } from "@models/event"
import { Frontmatter } from "@models/Frontmatter"
import { GroupFrontmatter, GroupMarkdownRemark } from "@models/group"
import { NetworkPageMarkdownRemark } from "@models/networks"
import { TopicFrontmatter, TopicMarkdownRemark } from "@models/topic"
import { ordEventData } from "@utils//event"
import { Link } from "@vx/network/lib/types"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Map from "fp-ts/lib/Map"
import * as NEA from "fp-ts/lib/NonEmptyArray"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import * as t from "io-ts"
import moment from "moment"
import * as Eq from "fp-ts/lib/Eq"

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

const getLinks = (nodes: EventPoint[], links: Map<string, NetworkLink[]>) => (
  relation: Array<Frontmatter & { color: string }>
): Map<string, NetworkLink[]> => {
  return pipe(
    nodes,
    A.reduce(links, (acc, p) => {
      const newLinks = pipe(
        relation,
        A.reduce(acc, (acc1, a) => {
          const lastLinks = pipe(
            Map.lookup(Ord.ordString)(a.uuid, acc1),
            O.getOrElse((): NetworkLink[] => [])
          )

          return pipe(
            acc1,
            Map.insertAt(Eq.eqString)(a.uuid, [
              ...lastLinks,
              {
                source: pipe(
                  A.last(lastLinks),
                  O.map((l) => l.target),
                  O.getOrElse(() => p)
                ),
                target: p,
                stroke: `#${a.color}`,
                fill: `#${a.color}`,
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
  selectedNodes: EventPoint[]
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
  graph: any
  // actors: Actor[]
  // topics: TopicListTopic[]
  // groups: Group[]
  selectedNodes: EventMarkdownRemark[]
  // selectedEventsCounter: { counter: number; total: number }
  // topicEventsMap: TopicEventsMap
  networkWidth: number
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
      const orderedEvents = pipe(events, A.sort(ordEventData))
      const eventMinDate = pipe(
        A.head(orderedEvents),
        O.map((e) => e.frontmatter.date)
      )

      const minDate = pipe(
        minDateOpt,
        O.alt(() => eventMinDate),
        O.getOrElse(() => moment().subtract(1, "week").toDate())
      )

      const eventMaxDate = pipe(
        A.last(orderedEvents),
        O.map((e) => e.frontmatter.date)
      )
      const maxDate = pipe(
        maxDateOpt,
        O.alt(() => eventMaxDate),
        O.getOrElse(() => new Date())
      )

      const networkWidth = moment(maxDate).diff(moment(minDate), "days") * 5

      const topics = events.reduce<TopicFrontmatter[]>(
        (acc, e) => [
          ...acc,
          ...e.frontmatter.topics.filter(
            (t) =>
              acc.find((i) => Eq.eqString.equals(i.uuid, t.uuid)) === undefined
          ),
        ],
        []
      )

      const yGetter = getY(topics, margin.vertical, height)

      const props = pipe(
        E.right<t.Errors, EventMarkdownRemark[]>(events),
        E.map((events) => {
          const result: Result = {
            eventNodes: [],
            topicLinks: Map.empty,
            actorLinks: Map.empty,
            groupLinks: Map.empty,
            selectedNodes: [],
          }

          const {
            eventNodes,
            selectedNodes,
            topicLinks,
            actorLinks,
            groupLinks,
          } = pipe(
            events,
            A.sortBy([ordEventData]),
            A.reduce(result, (acc, e) => {
              // get topic from relative directory

              const isBetweenDateRange = moment(e.frontmatter.date).isBetween(
                moment(minDate),
                moment(maxDate)
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

              if (isBetweenDateRange && (hasActor || hasGroup || hasTopic)) {
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
                    data: e,
                    color: t.color,
                  }))
                )

                const topicLinks = pipe(
                  e.frontmatter.topics,
                  getLinks(eventNodes, acc.topicLinks)
                )

                const actorLinks = pipe(
                  e.frontmatter.actors,
                  O.getOrElse((): ActorFrontmatter[] => []),
                  getLinks(eventNodes, acc.actorLinks)
                )
                const groupLinks = pipe(
                  e.frontmatter.groups,
                  O.getOrElse((): GroupFrontmatter[] => []),
                  getLinks(eventNodes, acc.groupLinks)
                )

                const eqUUID = pipe(
                  Eq.eqString,
                  Eq.contramap((e: EventPoint) => e.data.frontmatter.uuid)
                )

                return {
                  eventNodes: [...acc.eventNodes, ...eventNodes],
                  actorLinks: actorLinks,
                  topicLinks: topicLinks,
                  groupLinks: groupLinks,
                  selectedNodes: pipe(
                    acc.selectedNodes,
                    A.filter((e) =>
                      eventNodes.some((n) => eqUUID.equals(e, n))
                    ),
                    (events) => [...events, ...eventNodes]
                  ),
                }
              }
              return acc
            })
          )

          return {
            minDate,
            maxDate,
            scale,
            // groups: groupsList.map((a) => ({
            //   ...a.group,
            //   selected: selectedGroupIds.some((id) => id === a.group.uuid),
            // })),
            graph: {
              nodes: eventNodes,
              links: [
                ...Map.toArray(Ord.ordString)(topicLinks).flatMap(
                  ([_k, links]) => links
                ),
                ...Map.toArray(Ord.ordString)(groupLinks).flatMap(
                  ([_k, links]) => links
                ),
                ...Map.toArray(Ord.ordString)(actorLinks).flatMap(
                  ([_k, links]) => links
                ),
              ],
            },
            selectedNodes: selectedNodes.map((e) => e.data),
            networkWidth,
          }
        })
      )

      return props
    })
  )
}
