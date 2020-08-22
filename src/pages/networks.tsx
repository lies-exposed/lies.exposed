import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import Network, { NetworkProps } from "@components/Network/Network"
import { NetworkPageContent } from "@components/NetworkPageContent"
import SEO from "@components/SEO"
import { BubbleGraph } from "@components/graph/BubbleGraph"
import ActorList, { ActorListActor } from "@components/lists/ActorList"
import EventList from "@components/lists/EventList"
import GroupList, { Group } from "@components/lists/GroupList"
import TopicList, { TopicListTopic } from "@components/lists/TopicList"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { EventPoint } from "@models/event"
import {
  createNetwork,
  NetworkTemplateData,
} from "@templates/NetworkTemplate/createNetworkTemplateProps"
import { formatDate } from "@utils//date"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingLevel } from "baseui/heading"
import { LabelMedium } from "baseui/typography"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import { replace, graphql } from "gatsby"
import React from "react"

interface NetworkTemplateProps {
  navigate: (to: string) => void
  data: NetworkTemplateData
}

// const green = "#26deb0"

// const colors = {
//   topics: [
//     "#abe188",
//     ,
//     "#0256a1",
//     "#8ccc00",
//     "#fdb833",
//     "#fd6d34",
//     "#f0e345",
//     "#6de321",
//   ],
//   actors: [blue, green, peach, lightpurple, pink, "#f0e345"],
// }

const width = 1000
const height = 400
const margin = { vertical: 30, horizontal: 30 }

interface NetworkTemplateState {
  scale: NetworkProps["scale"]
  scalePoint: O.Option<EventPoint>
  selectedActorIds: string[]
  selectedGroupIds: string[]
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
    selectedGroupIds: [],
    selectedTopicIds: [],
  }

  onActorClick = (actor: ActorListActor): void => {
    this.setState({
      selectedActorIds: A.elem(Eq.eqString)(
        actor.uuid,
        this.state.selectedActorIds
      )
        ? A.array.filter(
            this.state.selectedActorIds,
            (a) => !Eq.eqString.equals(a, actor.uuid)
          )
        : this.state.selectedActorIds.concat(actor.uuid),
    })
  }

  onGroupClick = (g: Group): void => {
    this.setState({
      selectedGroupIds: A.elem(Eq.eqString)(g.uuid, this.state.selectedGroupIds)
        ? A.array.filter(
            this.state.selectedGroupIds,
            (a) => !Eq.eqString.equals(a, g.uuid)
          )
        : this.state.selectedGroupIds.concat(g.uuid),
    })
  }

  onTopicClick = (topic: TopicListTopic): void => {
    this.setState({
      selectedTopicIds: A.elem(Eq.eqString)(
        topic.uuid,
        this.state.selectedTopicIds
      )
        ? A.array.filter(
            this.state.selectedTopicIds,
            (a) => !Eq.eqString.equals(a, topic.uuid)
          )
        : this.state.selectedTopicIds.concat(topic.uuid),
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
      state: {
        scale,
        scalePoint,
        selectedActorIds,
        selectedGroupIds,
        selectedTopicIds,
      },
    } = this

    return pipe(
      createNetwork({
        data,
        scale,
        scalePoint,
        selectedActorIds,
        selectedGroupIds,
        selectedTopicIds,
        margin,
        height,
      }),
      E.fold(
        throwValidationErrors,
        ({
          pageContent,
          minDate,
          maxDate,
          scale,
          graph,
          actors,
          groups,
          topics,
          selectedNodes,
          selectedEventsCounter,
          topicEventsMap,
          networkWidth,
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
                      flexDirection="column"
                    >
                      <ActorList
                        actors={actors}
                        onActorClick={this.onActorClick}
                        avatarScale="scale1600"
                      />
                      <GroupList
                        groups={groups}
                        onGroupClick={this.onGroupClick}
                        avatarScale="scale1600"
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
                <FlexGridItem justifyContent="center" overflow={"scrollX"}>
                  <Network
                    width={networkWidth}
                    height={height}
                    scale={scale}
                    minDate={minDate}
                    maxDate={maxDate}
                    graph={graph}
                    onEventLabelClick={(event) => {
                      navigate(`/events/${event}`)
                    }}
                    onNodeClick={(event) =>
                      replace(`/networks/#${event.data.frontmatter.uuid}`)
                    }
                    onDoubleClick={this.onNetworkDoubleClick}
                  />
                </FlexGridItem>
                <FlexGridItem justifyContent="center">
                  <div style={{ width, height, margin: 30 }}>
                    <BubbleGraph<{
                      label: string
                      count: number
                      color: string
                    }>
                      width={width}
                      height={height}
                      data={pipe(
                        topicEventsMap,
                        Map.map((topic) => ({
                          label: topic.data.label,
                          count: topic.events.length,
                          color: topic.data.color,
                        })),
                        Map.toArray(Ord.ordString),
                        A.map((e) => e[1])
                      )}
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
  query Network {
    pageContent: file(
      childMarkdownRemark: { frontmatter: { slug: { eq: "networks" } } }
    ) {
      ...PageContentFileNode
    }

    topics: allMarkdownRemark(
      filter: { fields: { collection: { eq: "topics" } } }
    ) {
      nodes {
        ...TopicMarkdownRemark
      }
    }

    actors: allMarkdownRemark(
      filter: { fields: { collection: { eq: "actors" } } }
    ) {
      nodes {
        ...ActorMarkdownRemark
      }
    }

    groups: allMarkdownRemark(
      filter: { fields: { collection: { eq: "groups" } } }
    ) {
      nodes {
        ...GroupMarkdownRemark
      }
    }

    events: allMarkdownRemark(
      filter: { fields: { collection: { eq: "events" } } }
    ) {
      nodes {
        ...EventMarkdownRemark
      }
    }
  }
`
