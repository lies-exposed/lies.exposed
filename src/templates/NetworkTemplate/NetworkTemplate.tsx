import ActorList, { ActorListActor } from "@components/ActorList"
import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import EventList from "@components/EventList"
import { Layout } from "@components/Layout"
import Network, { NetworkProps } from "@components/Network/Network"
import { NetworkPageContent } from "@components/NetworkPageContent"
import SEO from "@components/SEO"
import TopicList, { TopicListTopic } from "@components/TopicList"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { EventPoint } from "@models/event"
import { formatDate } from "@utils//date"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingLevel } from "baseui/heading"
import { LabelMedium } from "baseui/typography"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { replace, graphql } from "gatsby"
import React from "react"
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
        actor.username,
        this.state.selectedActorIds
      )
        ? A.array.filter(
            this.state.selectedActorIds,
            a => !Eq.eqString.equals(a, actor.username)
          )
        : this.state.selectedActorIds.concat(actor.username),
    })
  }

  onTopicClick = (topic: TopicListTopic): void => {
    this.setState({
      selectedTopicIds: A.elem(Eq.eqString)(
        topic.slug,
        this.state.selectedTopicIds
      )
        ? A.array.filter(
            this.state.selectedTopicIds,
            a => !Eq.eqString.equals(a, topic.slug)
          )
        : this.state.selectedTopicIds.concat(topic.slug),
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
        throwValidationErrors,
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
              <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
              <FlexGrid
                alignItems="center"
                alignContent="center"
                justifyItems="center"
                flexGridColumnCount={1}
              >
                <FlexGridItem width="100%">
                  <HeadingLevel>
                    <NetworkPageContent {...pageContent.childMarkdownRemark} />
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
                  <LabelMedium>
                    {selectedEventsCounter.counter}/
                    {selectedEventsCounter.total}
                  </LabelMedium>
                  <LabelMedium>
                    Scale: {scale}, Date Range: {formatDate(minDate)} -{" "}
                    {formatDate(maxDate)}
                  </LabelMedium>
                </FlexGridItem>
                <FlexGridItem display="none" justifyContent="center">
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
                  <ContentWithSideNavigation
                    items={eventsDataToNavigatorItems(selectedNodes)}
                  >
                    <EventList events={selectedNodes} />
                  </ContentWithSideNavigation>
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
  query NetworkTemplateQuery {
    pageContent: file(
      relativeDirectory: { eq: "pages" }
      name: { eq: "networks" }
    ) {
      ...PageContentFileNode
    }

    topics: allFile(filter: { relativeDirectory: { eq: "topics" } }) {
      nodes {
        ...TopicFileNode
      }
    }

    actors: allFile(
      filter: {
        sourceInstanceName: { eq: "content" }
        relativeDirectory: { eq: "actors" }
      }
    ) {
      nodes {
        ...ActorPageContentFileNode
      }
    }

    events: allFile(
      filter: {
        sourceInstanceName: { eq: "content" }
        relativeDirectory: { eq: "events" }
      }
    ) {
      nodes {
        ...EventFileNode
      }
    }
  }
`
