import * as t from "io-ts"
import React from "react"
import SEO from "../../components/SEO"
import Layout from "../../components/Layout"
import { Columns } from "react-bulma-components"
import { useStaticQuery, graphql } from "gatsby"
import { EventPoint, EventNode } from "../../types/event"
import * as A from "fp-ts/lib/Array"
import { eqString } from "fp-ts/lib/Eq"
import { pipe } from "fp-ts/lib/pipeable"
import * as E from "fp-ts/lib/Either"
import { ThrowReporter } from "io-ts/lib/ThrowReporter"
import { PageContentNode } from "../../types/PageContent"
import Network from "../../components/Common/Network/Network"
import { ord, ordString, ordDate } from "fp-ts/lib/Ord"
import * as O from "fp-ts/lib/Option"
import * as Map from "fp-ts/lib/Map"
import { Link } from "@vx/network/lib/types"

interface NetworksPageProps {
  navigate: (to: string) => void
  data: {
    events: {
      nodes: {
        relativeDirectory: string
        childMarkdownRemark: EventNode
      }[]
    }
    images: {
      nodes: {
        id: string
        absolutePath: string
        childImageSharp: { fluid: { src: string } }
      }[]
    }
    pageContent: { childMarkdownRemark: PageContentNode }
  }
}

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
const actorColors = [blue, green, lightpurple, peach, pink, "#f0e345"]

// calculate x based on date
// (date - minDate) : (maxDate - minDate) = x : width
// x = (date - minDate) * width / (maxDate - minDate)
const getX = (date: Date, minDate: Date, maxDate: Date, width: number) => {
  return (
    ((date.getTime() - minDate.getTime()) * width) /
    (maxDate.getTime() - minDate.getTime())
  )
}

const byDate = ord.contramap(
  ordDate,
  (e: EventPoint) => e.data.frontmatter.date
)
const byEvent = ord.contramap(ordString, (e: EventPoint) => e.data.event)

const groupByEqualEvent = (
  events: Array<EventPoint>
): Array<Array<EventPoint>> =>
  pipe(
    A.sortBy([byEvent])(events),
    A.chop((as: Array<EventPoint>) => {
      const { init, rest } = A.spanLeft((a: EventPoint) => {
        return eqString.equals(a.data.event, as[0].data.event)
      })(as)

      return [init, rest]
    })
  )

interface NetworkLink extends Link<EventPoint> {
  fill: string
  stroke: string
}

const makeLinks = (
  colors: Array<string>,
  arr: Array<Array<EventPoint>>
): Array<NetworkLink> =>
  pipe(
    arr.map((subArray, n) =>
      subArray.reduce((acc, p, i) => {
        const fill = pipe(
          O.fromNullable(colors[n]),
          O.getOrElse(() => colors[0])
        )

        const stroke = fill

        acc.push({
          source: p,
          target: subArray[i + 1] ? subArray[i + 1] : p,
          stroke,
          fill,
        })
        return acc
      }, [] as NetworkLink[])
    ),
    A.flatten
  )

const NetworksPage = ({
  data: { pageContent, events, images },
  navigate,
}: NetworksPageProps) => {
  const {
    childMarkdownRemark: {
      frontmatter: { title },
      html,
    },
  } = pageContent

  const width = 900
  const height = 600
  const marginVertical = 30
  const marginHorizontal = 30

  const initial: any[] = []

  const points = events.nodes.reduce<typeof initial>((acc, n) => {
    const event = A.takeRight(1)(n.relativeDirectory.split("/"))[0]

    const cover = pipe(
      O.fromNullable(
        (n.childMarkdownRemark.frontmatter.cover as any) as string
      ),
      O.chain(cover =>
        O.fromNullable(images.nodes.find(e => e.absolutePath.indexOf(cover)))
      ),
      O.map(e => e.childImageSharp.fluid.src),
      O.toNullable
    )

    return acc.concat({
      x: 0,
      y: 0,
      data: {
        ...n.childMarkdownRemark,
        event,
        frontmatter: {
          ...n.childMarkdownRemark.frontmatter,
          cover,
        },
      },
    })
  }, initial)

  return pipe(
    t.array(EventPoint).decode(points),
    E.map(events => {
      const dates = events.map(e => e.data.frontmatter.date.getTime())
      const minDate = new Date(Math.min.apply(null, dates))
      const maxDate = new Date(Math.max.apply(null, dates))
      const eventsSortedDate = A.sortBy([byDate])(
        events.map(g => ({
          x:
            marginVertical +
            getX(
              g.data.frontmatter.date,
              minDate,
              maxDate,
              width - marginHorizontal * 2
            ),
          y: 0,
          data: g.data,
        }))
      )

      const eventsGroupedByEvent = groupByEqualEvent(eventsSortedDate)
      const eventsByName = A.array.mapWithIndex(
        eventsGroupedByEvent,
        (i, events): EventPoint[] => {
          const y =
            marginVertical +
            i * ((height - marginVertical * 2) / eventsGroupedByEvent.length)
          return events.map(e => ({ ...e, y }))
        }
      )

      const eventColors = A.zip(eventsByName, colors)
      const eventLabels = eventColors.map(([g, color]) => {
        return {
          x: width,
          y: g[0].y,
          label: g[0].data.event,
          fill: color,
        }
      })

      const actorsLinkInitial: Map<string, EventPoint[]> = Map.empty

      const actorLinks = eventsSortedDate.reduce((acc, e) => {
        const y = pipe(
          O.fromNullable(eventLabels.find(n => n.label === e.data.event)),
          O.map(_ => _.y),
          O.getOrElse(() => 0)
        )
        const eventsByActor = pipe(
          e.data.frontmatter.actors,
          O.map(actors => {
            return actors.reduce<Map<string, EventPoint[]>>((prev, a) => {
              const actorEventsList = pipe(
                Map.lookup(eqString)(a, prev),
                O.fold(
                  () => [{ ...e, y }],
                  elems => elems.concat({ ...e, y })
                )
              )
              return Map.insertAt(eqString)(a, actorEventsList)(prev)
            }, acc)
          }),
          O.getOrElse((): Map<string, EventPoint[]> => acc)
        )

        return eventsByActor
      }, actorsLinkInitial)

      return {
        minDate,
        maxDate,
        groupedEvents: eventsByName,
        eventLabels,
        eventColors: A.zip(
          eventLabels.map(l => l.label),
          colors
        ),
        actors: Map.keys(ordString)(actorLinks),
        actorLinks: makeLinks(
          actorColors,
          Map.toArray(ordString)(actorLinks).map(([_key, events]) => events)
        ),
      }
    }),
    E.map(
      ({
        minDate,
        maxDate,
        groupedEvents,
        eventLabels,
        eventColors,
        actors,
        actorLinks,
      }) => {
        const links = A.flatten(
          groupedEvents.map(eventsByPath =>
            eventsByPath.reduce((acc, p, i) => {
              const fill = pipe(
                O.fromNullable(
                  eventColors.find(([event, color]) => event === p.data.event)
                ),
                O.map(([event, color]) => color),
                O.getOrElse(() => eventColors[0][1])
              )

              const stroke = fill

              acc.push({
                source: p,
                target: eventsByPath[i + 1] ? eventsByPath[i + 1] : p,
                stroke,
                fill,
              })
              return acc
            }, [] as { source: EventPoint; target: EventPoint; stroke: string; fill: string }[])
          )
        ).concat(...actorLinks)

        return {
          minDate,
          maxDate,
          eventLabels,
          actors,
          graph: {
            nodes: A.flatten(groupedEvents),
            links,
          },
        }
      }
    ),
    E.fold(
      errs => {
        console.log(ThrowReporter.report(E.left(errs)))
        return null
      },
      ({ minDate, maxDate, actors, graph, eventLabels }) => {
        return (
          <Layout>
            <SEO title={title} />
            <Columns>
              <Columns.Column size={12}>
                <h1>{title}</h1>
                <div
                  className="content"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </Columns.Column>

              <Columns.Column size={3}>
                <ul>
                  {actors.map(a => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </Columns.Column>
              <Columns.Column size={9}>
                <div style={{ width, height }}>
                  <Network
                    width={width}
                    height={height}
                    minDate={minDate}
                    maxDate={maxDate}
                    graph={graph}
                    eventLabels={eventLabels}
                    eventColors={A.takeLeft(eventLabels.length)(colors)}
                    onEventLabelClick={event => {
                      navigate(`/timelines/${event}`)
                    }}
                    onNodeClick={event => {
                      navigate(`/networks/${event.data.event}`)
                    }}
                  />
                </div>
              </Columns.Column>
            </Columns>
          </Layout>
        )
      }
    )
  )
}

export default NetworksPage

export const pageQuery = graphql`
  query(
    $pageContentRelativePath: String!
    $eventsRelativeDirectory: String!
    $imagesRelativeDirectory: String!
  ) {
    pageContent: file(relativePath: { eq: $pageContentRelativePath }) {
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
