/**
 * @todo:
 * - show percentage of antiecologicalact/ecologicalact per topic
 */

import * as t from "io-ts"
import React from "react"
import SEO from "../../components/SEO"
import Layout from "../../components/Layout"
import { Columns, List, Image } from "../../components/Common"
import { graphql } from "gatsby"
import { EventPoint, EventFileNode } from "../../types/event"
import * as A from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/pipeable"
import * as E from "fp-ts/lib/Either"
import { ThrowReporter } from "io-ts/lib/ThrowReporter"
import { PageContentNode } from "../../types/PageContent"
import Network from "../../components/Common/Network/Network"
import * as Ord from "fp-ts/lib/Ord"
import * as O from "fp-ts/lib/Option"
import * as Map from "fp-ts/lib/Map"
import { Link } from "@vx/network/lib/types"
import { withDashes } from "../../utils/string"
import "./networkTemplate.scss"
import { ActorFileNode } from "../../types/actor"
import { ImageNode } from "../../utils/image"
import { TopicNode, TopicPoint } from "../../types/topic"
import * as Eq from "fp-ts/lib/Eq"

interface NetworksPageProps {
  navigate: (to: string) => void
  data: {
    pageContent: {
      childMarkdownRemark: PageContentNode
      relativeDirectory: string
    }
    topics: {
      nodes: TopicNode[]
    }
    actorsImages: {
      nodes: ImageNode[]
    }
    actors: {
      nodes: ActorFileNode[]
    }
    events: {
      nodes: EventFileNode[]
    }
    images: {
      nodes: {
        id: string
        absolutePath: string
        childImageSharp: { fluid: { src: string } }
      }[]
    }
  }
}

interface NetworkLink extends Link<EventPoint> {
  fill: string
  stroke: string
}

type TopicsMap = Map<string, TopicPoint>

type ActorId = string
type ActorsMapValue = {
  actor: ActorFileNode
  color: string
  events: EventPoint[]
  links: NetworkLink[]
  antiEcologicAct: number
  ecologicAct: number
  totalActs: number
}

type ActorsMap = Map<ActorId, ActorsMapValue>

const colors = [
  "#abe188",
  "#1789fc",
  "#0256a1",
  "#8ccc00",
  "#fdb833",
  "#fd6d34",
  "#f0e345",
]

const peach = "#fd9b93"
const pink = "#fe6e9e"
const blue = "#03c0dc"
const green = "#26deb0"
const lightpurple = "#374469"
const actorColors = [blue, green, peach, lightpurple, pink, "#f0e345"]

// calculate x based on date
// (date - minDate) : (maxDate - minDate) = x : width
// x = (date - minDate) * width / (maxDate - minDate)
const getX = (date: Date, minDate: Date, maxDate: Date, width: number) => {
  return (
    ((date.getTime() - minDate.getTime()) * width) /
    (maxDate.getTime() - minDate.getTime())
  )
}

const getY = (topics: Array<string>, margin: number, height: number) => (
  key: string
) => {
  const pos = topics.findIndex(t => Eq.eqString.equals(t, key))
  if (pos > -1) {
    return margin + pos * ((height - margin * 2) / topics.length)
  }
  return 0
}

const eventPointByDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: EventFileNode) => e.childMarkdownRemark.frontmatter.date
)

function addOneIfEqualTo(o: O.Option<string>, match: string): 0 | 1 {
  return pipe(
    o,
    O.exists(type => Eq.eqString.equals(type, match))
  )
    ? 1
    : 0
}

const width = 800
const height = 600
const marginVertical = 30
const marginHorizontal = 30

interface NetworkTemplateState {
  selectedActorIds: string[]
  selectedTopicIds: string[]
}

export default class NetworkTemplate extends React.Component<
  NetworksPageProps,
  NetworkTemplateState
> {
  state: NetworkTemplateState = {
    selectedActorIds: [],
    selectedTopicIds: [],
  }

  onActorClick = (actorId: string) => {
    this.setState({
      selectedActorIds: A.elem(Eq.eqString)(
        actorId,
        this.state.selectedActorIds
      )
        ? A.array.filter(
            this.state.selectedActorIds,
            a => !Eq.eqString.equals(a, actorId)
          )
        : this.state.selectedActorIds.concat(actorId),
    })
  }

  onTopicClick = (topicId: string) => {
    this.setState({
      selectedTopicIds: A.elem(Eq.eqString)(
        topicId,
        this.state.selectedTopicIds
      )
        ? A.array.filter(
            this.state.selectedTopicIds,
            a => !Eq.eqString.equals(a, topicId)
          )
        : this.state.selectedTopicIds.concat(topicId),
    })
  }

  render() {
    const {
      props: { data, navigate },
      state: { selectedActorIds, selectedTopicIds },
    } = this

    const networkName = A.takeRight(1)(
      data.pageContent.relativeDirectory.split("/")
    )[0]

    const yGetter = getY(
      data.topics.nodes.map(n => n.name),
      marginVertical,
      height
    )

    // create a topics map
    const topicsMap = data.topics.nodes.reduce<TopicsMap>((acc, t, i) => {
      return Map.insertAt(Eq.eqString)(t.name, {
        id: t.id,
        label: t.name,
        fill: colors[i],
        x: 0,
        y: yGetter(t.name),
      })(acc)
    }, Map.empty)

    const actorsMap = A.zip(data.actors.nodes, actorColors).reduce<ActorsMap>(
      (acc, [actor, color]) => {
        const cover = data.actorsImages.nodes.find(
          imageNode =>
            actor.childMarkdownRemark.frontmatter.avatar ===
            `${imageNode.name}${imageNode.ext}`
        )

        return Map.insertAt(Eq.eqString)(actor.id, {
          actor: {
            ...actor,
            childMarkdownRemark: {
              ...actor.childMarkdownRemark,
              frontmatter: {
                ...actor.childMarkdownRemark.frontmatter,
                cover: cover ? cover.childImageSharp.fluid.src : null,
              },
            },
          },
          color,
          events: [] as EventPoint[],
          links: [] as NetworkLink[],
          antiEcologicAct: 0,
          ecologicAct: 0,
          totalActs: 0,
        })(acc)
      },
      Map.empty
    )

    return pipe(
      t.array(EventFileNode).decode(data.events.nodes),
      E.map(events => {
        const eventsSortedByDate = pipe(events, A.sortBy([eventPointByDate]))

        const minDate =
          eventsSortedByDate[0].childMarkdownRemark.frontmatter.date
        const maxDate = pipe(
          A.last(eventsSortedByDate),
          O.map(e => e.childMarkdownRemark.frontmatter.date),
          O.getOrElse(() => new Date())
        )

        type Result = {
          eventNodes: Map<string, EventPoint[]>
          eventLinks: Map<string, NetworkLink[]>
          actorsWithEventsAndLinksMap: ActorsMap
        }

        const result: Result = {
          eventNodes: Map.empty,
          eventLinks: Map.empty,
          actorsWithEventsAndLinksMap: Map.empty,
        }

        const {
          eventNodes,
          eventLinks,
          actorsWithEventsAndLinksMap,
        } = eventsSortedByDate.reduce<Result>((acc, e) => {
          // get topic from relative directory

          const cover = pipe(
            e.childMarkdownRemark.frontmatter.cover,
            O.chain(c =>
              O.fromNullable(
                data.images.nodes.find(e => e.absolutePath.indexOf(c))
              )
            ),
            O.map(e => e.childImageSharp.fluid.src)
          )

          const topic = pipe(
            A.head(A.takeRight(1)(e.relativeDirectory.split("/"))),
            O.chain(t => Map.lookup(Eq.eqString)(t, topicsMap)),
            O.getOrElse(() => ({
              id: "fake-id",
              x: -100,
              y: -100,
              label: "fake",
              fill: colors[0],
            }))
          )

          const isTopicSelected = A.elem(Eq.eqString)(topic.id, selectedTopicIds)

          const eventPoint: EventPoint = {
            x:
              marginHorizontal +
              getX(
                e.childMarkdownRemark.frontmatter.date,
                minDate,
                maxDate,
                width - marginHorizontal * 2
              ),
            y: yGetter(topic.label),
            data: {
              ...e.childMarkdownRemark,
              topic: topic.label,
              fill: topic.fill,
              frontmatter: {
                ...e.childMarkdownRemark.frontmatter,
                cover,
              },
            },
          }

          const eventNodes = isTopicSelected
            ? pipe(
                Map.lookup(Eq.eqString)(topic.id, acc.eventNodes),
                O.fold(
                  () => [eventPoint],
                  events => events.concat(eventPoint)
                )
              )
            : []

          const eventLinks = isTopicSelected
            ? pipe(
                Map.lookup(Eq.eqString)(topic.id, acc.eventLinks),
                O.fold(
                  () => [
                    {
                      source: eventPoint,
                      target: eventPoint,
                      fill: topic.fill,
                      stroke: topic.fill,
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
                      stroke: topic.fill,
                      fill: topic.fill,
                    })
                  }
                )
              )
            : []

          const actorsWithEventsAndLinksMap = pipe(
            e.childMarkdownRemark.frontmatter.actors,
            O.map(actors => {
              return Map.toArray(Ord.ordString)(actorsMap)
                .filter(([_, a]) =>
                  actors.includes(
                    a.actor.childMarkdownRemark.frontmatter.username
                  )
                )
                .reduce<ActorsMap>((prev, [_, a]) => {
                  const actorData = pipe(
                    Map.lookup(Eq.eqString)(a.actor.id, prev),
                    O.fold(
                      (): ActorsMapValue => {
                        const events = A.elem(Eq.eqString)(
                          a.actor.id,
                          selectedActorIds
                        )
                          ? [eventPoint]
                          : []

                        return {
                          ...a,
                          ecologicAct: addOneIfEqualTo(
                            e.childMarkdownRemark.frontmatter.type,
                            "EcologicAct"
                          ),
                          antiEcologicAct: addOneIfEqualTo(
                            e.childMarkdownRemark.frontmatter.type,
                            "AntiEcologicAct"
                          ),
                          events: isTopicSelected ? events : [],
                          links: [],
                          totalActs: 1,
                        }
                      },
                      (item): ActorsMapValue => {
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
                          events: isTopicSelected ? events : [],
                          links: isTopicSelected ? item.links.concat(link) : item.links,
                          ecologicAct:
                            item.ecologicAct +
                            addOneIfEqualTo(
                              e.childMarkdownRemark.frontmatter.type,
                              "EcologicAct"
                            ),
                          antiEcologicAct:
                            item.antiEcologicAct +
                            addOneIfEqualTo(
                              e.childMarkdownRemark.frontmatter.type,
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

          console.log(actorsMap)

          return {
            eventNodes: Map.insertAt(Eq.eqString)(topic.id, eventNodes)(
              acc.eventNodes
            ),
            eventLinks: Map.insertAt(Eq.eqString)(topic.id, eventLinks)(
              acc.eventLinks
            ),
            actorsWithEventsAndLinksMap: actorsWithEventsAndLinksMap,
          }
        }, result)

        const nodes = Map.toArray(Ord.ordString)(eventNodes).reduce<
          EventPoint[]
        >((acc, [_, nodes]) => acc.concat(...nodes), [])

        const links = Map.toArray(Ord.ordString)(eventLinks).reduce<
          NetworkLink[]
        >((acc, [_, links]) => acc.concat(...links), [])

        type ActorsResults = {
          actors: Omit<ActorsMapValue, "events" | "links">[]
          links: NetworkLink[]
        }
        const actorResults = Map.toArray(Ord.ordString)(
          actorsWithEventsAndLinksMap
        ).reduce<ActorsResults>(
          (acc, [_, value]) => ({
            actors: acc.actors.concat({
              actor: value.actor,
              antiEcologicAct: value.antiEcologicAct,
              ecologicAct: value.ecologicAct,
              totalActs: value.totalActs,
              color: value.color,
            }),
            links: acc.links.concat(...value.links),
          }),
          { actors: [], links: [] }
        )

        return {
          minDate,
          maxDate,
          pageContent: data.pageContent,
          topics: Map.toArray(Ord.ordString)(topicsMap).map(
            ([_, topic]) => topic
          ),
          topicsColors: A.zip(
            data.topics.nodes.map(l => l.id),
            colors
          ),
          actors: actorResults.actors,
          graph: {
            nodes,
            links: links.concat(...actorResults.links),
          },
        }
      }),
      E.fold(
        errs => {
          console.log(ThrowReporter.report(E.left(errs)))
          return null
        },
        ({ pageContent, minDate, maxDate, graph, actors, topics }) => {
          return (
            <Layout>
              <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
              <Columns>
                <Columns.Column size={12} style={{ textAlign: "center" }}>
                  <div className="title">
                    {pageContent.childMarkdownRemark.frontmatter.title}
                  </div>
                  <div
                    className="content"
                    dangerouslySetInnerHTML={{
                      __html: pageContent.childMarkdownRemark.html,
                    }}
                  />
                </Columns.Column>

                <Columns.Column size={2}>
                  <List>
                    {actors.map(a => (
                      <List.Item
                        key={a.actor.id}
                        active={A.elem(Eq.eqString)(
                          a.actor.id,
                          selectedActorIds
                        )}
                        style={{ cursor: "pointer" }}
                        onClick={() => this.onActorClick(a.actor.id)}
                      >
                        <>
                          {a.actor.childMarkdownRemark.frontmatter.cover && (
                            <span style={{ display: "inline-block" }}>
                              <Image
                                rounded={true}
                                src={
                                  a.actor.childMarkdownRemark.frontmatter.cover
                                }
                                size={32}
                              />
                            </span>
                          )}{" "}
                          <span>
                            {a.antiEcologicAct} / {a.totalActs}
                          </span>
                          <span
                            style={{
                              display: "inline-block",
                              width: 20,
                              height: 10,
                              backgroundColor: a.color,
                            }}
                          />
                        </>
                      </List.Item>
                    ))}
                  </List>
                </Columns.Column>
                <Columns.Column size={8}>
                  <div style={{ width, height }}>
                    <Network
                      width={width}
                      height={height}
                      minDate={minDate}
                      maxDate={maxDate}
                      graph={graph}
                      topics={topics}
                      onEventLabelClick={event => {
                        navigate(`/timelines/${networkName}/${event}`)
                      }}
                      onNodeClick={event => {
                        const url = `/timelines/${networkName}/${
                          event.data.topic
                        }#${withDashes(
                          event.data.frontmatter.title.toLowerCase()
                        )}`
                        navigate(url)
                      }}
                    />
                  </div>
                </Columns.Column>
                <Columns.Column size={2}>
                  <List>
                    {topics.map(t => (
                      <List.Item
                        key={t.id}
                        style={{ cursor: "pointer" }}
                        active={A.elem(Eq.eqString)(t.id, selectedTopicIds)}
                        onClick={() => this.onTopicClick(t.id)}
                      >
                        <>
                          <span style={{ color: t.fill }}>{t.label}</span>{" "}
                          {/* <span>
                          {t.antiEcologicAct} / {t.totalActs}
                        </span> */}
                        </>
                      </List.Item>
                    ))}
                  </List>
                </Columns.Column>
              </Columns>
            </Layout>
          )
        }
      )
    )
  }
}

export const pageQuery = graphql`
  query(
    $relativeDirectory: String!
    $eventsRelativeDirectory: String!
    $imagesRelativeDirectory: String!
  ) {
    pageContent: file(
      relativeDirectory: { eq: $relativeDirectory }
      name: { eq: "index" }
    ) {
      relativeDirectory
      childMarkdownRemark {
        id
        frontmatter {
          title
          path
          date
          icon
          type
          cover
        }
        html
      }
    }
    topics: allDirectory(
      filter: { relativeDirectory: { eq: $relativeDirectory } }
    ) {
      nodes {
        id
        name
      }
    }
    actors: allFile(
      filter: {
        relativeDirectory: { glob: "events/actors/*" }
        name: { eq: "index" }
      }
    ) {
      nodes {
        id
        relativeDirectory
        childMarkdownRemark {
          frontmatter {
            title
            cover
            avatar
            username
          }
        }
      }
    }
    actorsImages: allFile(
      filter: { relativeDirectory: { glob: "events/actors/**/images" } }
    ) {
      nodes {
        relativeDirectory
        name
        ext
        childImageSharp {
          fluid {
            src
          }
        }
      }
    }
    events: allFile(
      filter: {
        relativeDirectory: { glob: $eventsRelativeDirectory }
        name: { ne: "index" }
      }
    ) {
      nodes {
        relativeDirectory
        childMarkdownRemark {
          id
          frontmatter {
            title
            path
            date
            icon
            type
            cover
            actors
          }
        }
      }
    }
    images: allFile(
      filter: { relativeDirectory: { glob: $imagesRelativeDirectory } }
    ) {
      nodes {
        childImageSharp {
          fixed {
            src
          }
        }
        relativeDirectory
        relativePath
      }
    }
  }
`
