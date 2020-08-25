import { ActorPageContent } from "@components/ActorPageContent"
import { Layout } from "@components/Layout"
import Network from "@components/Network/Network"
import SEO from "@components/SEO"
import EventList from "@components/lists/EventList"
import { ActorMarkdownRemark } from "@models/actor"
import { EventMarkdownRemark } from "@models/event"
import { TopicMarkdownRemark } from "@models/topic"
import { createNetworkTemplateProps } from "@templates/NetworkTemplate/createNetworkTemplateProps"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { Block } from "baseui/block"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, navigate } from "gatsby"
import moment from "moment"
import React from "react"

interface ActorTimelineTemplatePageProps {
  navigate: typeof navigate
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: ActorMarkdownRemark
    actors: {
      nodes: ActorMarkdownRemark[]
    }
    topics: {
      nodes: TopicMarkdownRemark[]
    }
    events: {
      nodes: EventMarkdownRemark[]
    }
  }
}

const ActorTimelineTemplate: React.FC<ActorTimelineTemplatePageProps> = ({
  data,
}) => {
  return pipe(
    ActorMarkdownRemark.decode(data.pageContent),
    E.chain((pageContent) =>
      sequenceS(E.either)({
        pageContent: E.right(pageContent),
        networkProps: createNetworkTemplateProps({
          data: {
            events: data.events,
            actors: { nodes: [] },
            groups: { nodes: [] },
          },
          height: 200,
          margin: { vertical: 20, horizontal: 20 },
          scale: "all",
          scalePoint: O.none,
          selectedActorIds: [pageContent.frontmatter.uuid],
          selectedTopicIds: [],
          selectedGroupIds: [],
        }),
      })
    ),
    E.fold(throwValidationErrors, ({ pageContent, networkProps }) => {
      const { selectedNodes, networkWidth, graph } = networkProps
      return (
        <Layout>
          <SEO title={pageContent.frontmatter.fullName} />
          {/* <FlexGridItem>
            <CalendarHeatmap
              width={1000}
              height={300}
              events={events}
              onCircleClick={async event => {
                await navigate(`#${event.id}`)
              }}
            />
            </FlexGridItem> */}
          <Block
            overrides={{
              Block: {
                style: {
                  overflow: "scroll",
                  width: "100%",
                },
              },
            }}
          >

            <Network
              width={networkWidth}
              height={200}
              minDate={moment().subtract(1, "y").toDate()}
              maxDate={new Date()}
              graph={graph}
              scale="all"
              onDoubleClick={() => {}}
              onNodeClick={async (e) => await navigate(`/actors/${pageContent.frontmatter.uuid}/#${e.data.frontmatter.uuid}`)}
              onEventLabelClick={() => {}}
            />
          </Block>
          <ActorPageContent {...pageContent} />
          <EventList events={selectedNodes} />
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query ActorTimelineTemplatePage($actorUUID: String!) {
    pageContent: markdownRemark(frontmatter: { uuid: { eq: $actorUUID } }) {
      ...ActorMarkdownRemark
    }

    events: allMarkdownRemark(
      filter: {
        fields: {
          collection: { eq: "events" }
          actors: { elemMatch: { uuid: { in: [$actorUUID] } } }
        }
      }
    ) {
      nodes {
        ...EventMarkdownRemark
      }
    }
  }
`

export default ActorTimelineTemplate
