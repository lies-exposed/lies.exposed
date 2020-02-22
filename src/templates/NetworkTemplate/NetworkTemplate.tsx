import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingLevel, Heading } from "baseui/heading"
import { Theme } from "baseui/theme"
import { LabelMedium } from "baseui/typography"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, replace, navigate } from "gatsby"
import { ThrowReporter } from "io-ts/lib/ThrowReporter"
import React from "react"
import ActorList, { ActorListActor } from "../../components/ActorList/ActorList"
import Network, { NetworkProps } from "../../components/Common/Network/Network"
import EventList from "../../components/EventList/EventList"
import Layout from "../../components/Layout"
import SEO from "../../components/SEO"
import TimelineNavigator from "../../components/TimelineNavigator/TimelineNavigator"
import TopicList, { TopicListTopic } from "../../components/TopicList/TopicList"
import { EventPoint } from "../../types/event"
import { formatDate } from "../../utils/date"
import renderMarkdownAST from "../../utils/renderMarkdownAST"
import {
  createNetwork,
  NetworkTemplateData,
} from "./createNetworkTemplateProps"

interface NetworkTemplateProps {
  navigate: (to: string) => void
  data: NetworkTemplateData
}
const peach = "#fd9b93"
const pink = "#fe6e9e"
const blue = "#03c0dc"
const green = "#26deb0"
const lightpurple = "#374469"

const colors = {
  topics: [
    "#abe188",
    "#1789fc",
    "#0256a1",
    "#8ccc00",
    "#fdb833",
    "#fd6d34",
    "#f0e345",
    "#6de321",
  ],
  actors: [blue, green, peach, lightpurple, pink, "#f0e345"],
}

interface RenderEventsProps {
  networkName: string
  selectedNodes: EventPoint[]
}

const renderEvents: React.FC<RenderEventsProps> = ({
  networkName,
  selectedNodes,
}) => {
  return (
    <FlexGrid
      flexGridColumnCount={4}
      flexGridColumnGap="scale800"
      flexGridRowGap="scale800"
      marginBottom="scale800"
      alignItems="start"
    >
      <FlexGridItem display="flex" alignItems="center" justifyContent="center">
        <TimelineNavigator
          events={selectedNodes.map(n => ({
            ...n.data,
            frontmatter: {
              ...n.data.frontmatter,
              actors: pipe(
                n.data.frontmatter.actors,
                O.fold(
                  () => [],
                  a => a.map(_ => _.id)
                )
              ),
            },
          }))}
          onEventClick={async e => {
            await navigate(`/networks/${networkName}?#${e.id}`)
          }}
        />
      </FlexGridItem>
      <FlexGridItem
        display="flex"
        alignItems="center"
        justifyContent="center"
        overrides={{
          Block: {
            style: ({ $theme }: { $theme: Theme }) => {
              return { width: `calc((200% - ${$theme.sizing.scale800}) / 3)` }
            },
          },
        }}
      >
        <EventList events={selectedNodes.map(n => n.data)} />
      </FlexGridItem>
      <FlexGridItem display="none">
        This invisible one is needed so the margins line up
      </FlexGridItem>
    </FlexGrid>
  )
}

const width = 1000
const height = 400
const margin = { vertical: 30, horizontal: 30 }

interface NetworkTemplateState {
  scale: NetworkProps["scale"]
  scalePoint: O.Option<EventPoint>
  selectedActorIds: string[]
  selectedTopicIds: string[]
}

export default class NetworkTemplate extends React.Component<
  NetworkTemplateProps,
  NetworkTemplateState
> {
  state: NetworkTemplateState = {
    scale: "all",
    scalePoint: O.none,
    selectedActorIds: [],
    selectedTopicIds: [],
  }

  onActorClick = (actor: ActorListActor): void => {
    this.setState({
      selectedActorIds: A.elem(Eq.eqString)(
        actor.id,
        this.state.selectedActorIds
      )
        ? A.array.filter(
            this.state.selectedActorIds,
            a => !Eq.eqString.equals(a, actor.id)
          )
        : this.state.selectedActorIds.concat(actor.id),
    })
  }

  onTopicClick = (topic: TopicListTopic): void => {
    this.setState({
      selectedTopicIds: A.elem(Eq.eqString)(
        topic.id,
        this.state.selectedTopicIds
      )
        ? A.array.filter(
            this.state.selectedTopicIds,
            a => !Eq.eqString.equals(a, topic.id)
          )
        : this.state.selectedTopicIds.concat(topic.id),
    })
  }

  onNetworkDoubleClick = (
    scalePoint: EventPoint,
    scale: NetworkProps["scale"]
  ): void => {
    this.setState({
      scalePoint: O.some(scalePoint),
      scale:
        scale === "all"
          ? "year"
          : scale === "year"
          ? "month"
          : scale === "month"
          ? "week"
          : scale === "week"
          ? "day"
          : "all",
    })
  }

  render(): React.ReactElement | null {
    const {
      props: { data, navigate },
      state: { scale, scalePoint, selectedActorIds, selectedTopicIds },
    } = this

    return pipe(
      createNetwork({
        data,
        scale,
        scalePoint,
        selectedActorIds,
        selectedTopicIds,
        margin,
        colors,
        height,
        width,
      }),
      E.fold(
        errs => {
          // eslint-disable-next-line no-console
          console.log(ThrowReporter.report(E.left(errs)))
          return null
        },
        ({
          networkName,
          pageContent,
          minDate,
          maxDate,
          scale,
          graph,
          actors,
          topics,
          selectedNodes,
          selectedEventsCounter,
        }) => {
          return (
            <Layout>
              <SEO title={pageContent.frontmatter.title} />
              <FlexGrid
                alignItems="center"
                alignContent="center"
                justifyItems="center"
                flexGridColumnCount={1}
              >
                <FlexGridItem
                  justifyItems="center"
                  alignItems="center"
                  alignContent="center"
                  width="100%"
                >
                  <HeadingLevel>
                    <Heading $style={{ textAlign: "center" }}>
                      {pageContent.frontmatter.title}
                    </Heading>

                    {renderMarkdownAST(pageContent.htmlAst)}
                  </HeadingLevel>
                  <FlexGrid flexGridColumnCount={2}>
                    <FlexGridItem>
                      <TopicList
                        topics={topics}
                        onTopicClick={this.onTopicClick}
                      />
                    </FlexGridItem>
                    <FlexGridItem
                      display="flex"
                      flexGridColumnCount={1}
                      justifyContent="end"
                    >
                      <ActorList
                        actors={actors.map(a => a.actor)}
                        onActorClick={this.onActorClick}
                      />
                    </FlexGridItem>
                  </FlexGrid>

                  <div>
                    {selectedEventsCounter.counter}/
                    {selectedEventsCounter.total}
                  </div>
                  <LabelMedium>
                    Scale: {scale}, Date Range: {formatDate(minDate)} -{" "}
                    {formatDate(maxDate)}
                  </LabelMedium>
                </FlexGridItem>
                <FlexGridItem display="flex" justifyContent="center">
                  <div style={{ width, height, margin: 30 }}>
                    <Network
                      width={width}
                      height={height}
                      scale={scale}
                      minDate={minDate}
                      maxDate={maxDate}
                      graph={graph}
                      onEventLabelClick={event => {
                        navigate(`/timelines/${networkName}/${event}`)
                      }}
                      onNodeClick={event =>
                        replace(`/networks/${networkName}/#${event.data.id}`)
                      }
                      onDoubleClick={this.onNetworkDoubleClick}
                    />
                  </div>
                </FlexGridItem>
                <FlexGridItem>
                  {renderEvents({ networkName, selectedNodes })}
                </FlexGridItem>
              </FlexGrid>
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
        htmlAst
      }
    }
    topics: allFile(
      filter: {
        relativeDirectory: { glob: $eventsRelativeDirectory }
        name: { eq: "index" }
      }
    ) {
      nodes {
        relativeDirectory
        childMarkdownRemark {
          id
          frontmatter {
            title
            slug
          }
        }
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
          htmlAst
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
            links
            cover
          }
          htmlAst
        }
      }
    }
    images: allFile(
      filter: { relativeDirectory: { glob: $imagesRelativeDirectory } }
    ) {
      nodes {
        childImageSharp {
          fluid {
            src
          }
          fixed {
            src
          }
        }
        name
        ext
        absolutePath
        relativeDirectory
        relativePath
      }
    }
  }
`
