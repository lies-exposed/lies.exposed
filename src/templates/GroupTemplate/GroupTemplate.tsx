import { GroupPageContent } from "@components/GroupPageContent"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import SEO from "@components/SEO"
import Network from "@components/graph/Network/Network"
import EventList from "@components/lists/EventList"
import { EventMarkdownRemark } from "@models/event"
import { GroupMarkdownRemark } from "@models/group"
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

interface GroupTemplatePageProps {
  navigate: typeof navigate
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: { childMarkdownRemark: GroupMarkdownRemark }
    events: {
      nodes: EventMarkdownRemark[]
    }
  }
}

const GroupTemplate: React.FC<GroupTemplatePageProps> = ({ data }) => {
  return pipe(
    GroupMarkdownRemark.decode(data.pageContent.childMarkdownRemark),
    E.chain((pageContent) => {
      const selectedGroupIds = [pageContent.frontmatter.uuid]
      const selectedActorIds: string[] = []
      const selectedTopicIds: string[] = []

      return sequenceS(E.either)({
        pageContent: E.right(pageContent),
        networkProps: createNetworkTemplateProps({
          minDate: O.none,
          maxDate: O.none,
          data: {
            events: data.events,
          },
          margin: { vertical: 20, horizontal: 20 },
          height: 200,
          width: 1300,
          scale: "all",
          scalePoint: O.none,
          selectedGroupIds,
          selectedActorIds,
          selectedTopicIds,
        }),
      })
    }),
    E.fold(throwValidationErrors, ({ pageContent, networkProps }) => {
      const { selectedEvents, graph, width, height } = networkProps
      return (
        <Layout>
          <SEO title={pageContent.frontmatter.name} />
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
              width={width}
              height={height}
              minDate={moment().subtract(1, "y").toDate()}
              maxDate={new Date()}
              graph={graph}
              scale="all"
              onDoubleClick={() => {}}
              onNodeClick={() => {}}
              onEventLabelClick={() => {}}
            />
          </Block>
          <MainContent>
            <GroupPageContent
              {...pageContent}
              members={pipe(
                pageContent.frontmatter.members,
                O.map((members) =>
                  members.map((m) => ({
                    ...m,
                    selected: true,
                  }))
                )
              )}
              onMemberClick={async (a) => {
                await navigate(`/actors/${a.uuid}`)
              }}
            />
            <EventList events={selectedEvents} />
          </MainContent>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query GroupTemplateQuery($group: String!) {
    pageContent: file(
      name: { eq: $group }
      sourceInstanceName: { eq: "groups" }
    ) {
      childMarkdownRemark {
        ...GroupMarkdownRemark
      }
    }

    events: allMarkdownRemark(
      filter: { fields: { groups: { in: [$group] } } }
    ) {
      nodes {
        ...EventMarkdownRemark
      }
    }
  }
`

export default GroupTemplate
