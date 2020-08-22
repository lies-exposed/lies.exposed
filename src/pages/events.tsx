import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import EventsMap from "@components/EventsMap"
import { Layout } from "@components/Layout"
import { NetworkProps } from "@components/Network/Network"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import ActorList, { ActorListActor } from "@components/lists/ActorList"
import EventList from "@components/lists/EventList"
import GroupList, { Group } from "@components/lists/GroupList"
import TopicList, { TopicListTopic } from "@components/lists/TopicList"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { ActorMarkdownRemark } from "@models/actor"
import { EventMarkdownRemark, EventPoint } from "@models/event"
import { GroupMarkdownRemark } from "@models/group"
import { PageContentFileNode } from "@models/page"
import { TopicMarkdownRemark } from "@models/topic"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingLevel } from "baseui/heading"
import { LabelMedium } from "baseui/typography"
import { sequenceS } from "fp-ts/lib/Apply"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Eq from "fp-ts/lib/Eq"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql } from "gatsby"
import * as t from "io-ts"
import React from "react"

const width = 1000
const height = 400
// const margin = { vertical: 30, horizontal: 30 }

interface EventsPageProps {
  data: {
    pageContent: unknown
    events: { nodes: unknown }
    topics: { nodes: unknown }
    actors: { nodes: unknown }
    groups: { nodes: unknown }
  }
}

interface EventsPageState {
  scale: NetworkProps["scale"]
  scalePoint: O.Option<EventPoint>
  selectedActorIds: string[]
  selectedGroupIds: string[]
  selectedTopicIds: string[]
}

export default class EventsPage extends React.Component<
  EventsPageProps,
  EventsPageState
> {
  state: EventsPageState = {
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

  render(): React.ReactElement | null {
    const {
      props: { data },
      state: {
        scale,
        //   scalePoint,
        selectedActorIds,
        selectedGroupIds,
        selectedTopicIds,
      },
    } = this

    return pipe(
      sequenceS(E.either)({
        pageContent: PageContentFileNode.decode(data.pageContent),
        topics: t.array(TopicMarkdownRemark).decode(data.topics.nodes),
        actors: t.array(ActorMarkdownRemark).decode(data.actors.nodes),
        groups: t.array(GroupMarkdownRemark).decode(data.groups.nodes),
        events: t.array(EventMarkdownRemark).decode(data.events.nodes),
      }),
      E.fold(
        throwValidationErrors,
        ({ pageContent, events, actors, topics, groups }) => {
          const filteredEvents = events.filter((e) => {
            const hasActor = pipe(
              e.frontmatter.actors,
              O.map((actors) =>
                actors.some((i) => selectedActorIds.includes(i))
              ),
              O.getOrElse(() => false)
            )

            const hasGroup = pipe(
              e.frontmatter.groups,
              O.map((actors) =>
                actors.some((i) => selectedGroupIds.includes(i))
              ),
              O.getOrElse(() => false)
            )

            const hasTopic = pipe(
              O.some(e.frontmatter.topics),
              O.map((actors) =>
                actors.some((i) => selectedTopicIds.includes(i))
              ),
              O.getOrElse(() => false)
            )

            return hasActor || hasGroup || hasTopic
          })

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
                    <PageContent {...pageContent.childMarkdownRemark} />
                  </HeadingLevel>
                  <FlexGrid flexGridColumnCount={2}>
                    <FlexGridItem>
                      <TopicList
                        topics={topics.map((t) => ({
                          ...t.frontmatter,
                          selected: selectedTopicIds.includes(
                            t.frontmatter.uuid
                          ),
                        }))}
                        onTopicClick={this.onTopicClick}
                      />
                    </FlexGridItem>
                    <FlexGridItem
                      display="flex"
                      flexGridColumnCount={1}
                      justifyContent="end"
                      flexDirection="column"
                    >
                      <GroupList
                        groups={groups.map((g) => ({
                          ...g.frontmatter,
                          selected: selectedGroupIds.includes(
                            g.frontmatter.uuid
                          ),
                        }))}
                        onGroupClick={this.onGroupClick}
                        avatarScale="scale1000"
                      />
                      <ActorList
                        actors={actors.map((a) => ({
                          ...a.frontmatter,
                          selected: selectedActorIds.includes(
                            a.frontmatter.uuid
                          ),
                        }))}
                        onActorClick={this.onActorClick}
                        avatarScale="scale1000"
                      />
                    </FlexGridItem>
                  </FlexGrid>
                  <LabelMedium>Scale: {scale}</LabelMedium>
                </FlexGridItem>
                <FlexGridItem justifyContent="center" overflow={"scrollX"}>
                  <EventsMap
                    width={width}
                    height={height}
                    events={filteredEvents}
                  />
                </FlexGridItem>
                <FlexGridItem>
                  <ContentWithSideNavigation
                    items={eventsDataToNavigatorItems(filteredEvents)}
                  >
                    <EventList events={filteredEvents} />
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
  query EventsQuery {
    pageContent: file(
      childMarkdownRemark: { frontmatter: { slug: { eq: "events" } } }
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
      sort: { fields: frontmatter___date, order: DESC }
    ) {
      nodes {
        ...EventMarkdownRemark
      }
    }
  }
`
