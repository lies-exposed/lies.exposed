import { GroupPageContent } from "@components/GroupPageContent"
import { Layout } from "@components/Layout"
import Network from "@components/Network/Network"
import SEO from "@components/SEO"
import EventList from "@components/lists/EventList"
import { EventMarkdownRemark } from "@models/event"
import { GroupMarkdownRemark } from "@models/group"
import { TopicFrontmatter } from "@models/topic"
import { createNetworkTemplateProps } from "@templates/NetworkTemplate/createNetworkTemplateProps"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { Block } from "baseui/block"
import { sequenceS } from "fp-ts/lib/Apply"
import * as A from "fp-ts/lib/Array"
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
    pageContent: GroupMarkdownRemark
    events: {
      nodes: EventMarkdownRemark[]
    }
  }
}

const GroupTemplate: React.FC<GroupTemplatePageProps> = ({ data }) => {
  return pipe(
    GroupMarkdownRemark.decode(data.pageContent),
    E.chain((pageContent) => {
      const selectedGroupIds = [pageContent.frontmatter.uuid]
      const selectedActorIds = pipe(
        pageContent.frontmatter.members,
        O.getOrElse((): string[] => [])
      )

      const topics = data.events.nodes.reduce<TopicFrontmatter[]>(
        (acc, e) =>
          pipe(
            (e.fields.topics as any) as TopicFrontmatter[],
            A.filter((t) => acc.find((_) => _.uuid === t.uuid) === undefined),
            (topics) => [...acc, ...topics]
          ),
        []
      )

      console.log(topics, data.events.nodes)
      const selectedTopicIds = topics.map((t) => t.uuid)

      
      return sequenceS(E.either)({
        pageContent: E.right(pageContent),
        networkProps: createNetworkTemplateProps({
          data: {
            events: data.events,
            actors: { nodes: [] },
            groups: { nodes: [data.pageContent] },
          },
          margin: { vertical: 20, horizontal: 20 },
          height: 200,
          scale: "all",
          scalePoint: O.none,
          selectedGroupIds,
          selectedActorIds,
          selectedTopicIds,
        }),
      })
    }),
    E.fold(throwValidationErrors, ({ pageContent, networkProps }) => {
      const { selectedNodes, graph, networkWidth } = networkProps
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
              width={networkWidth}
              height={200}
              minDate={moment().subtract(1, "y").toDate()}
              maxDate={new Date()}
              graph={graph}
              scale="all"
              onDoubleClick={() => {}}
              onNodeClick={() => {}}
              onEventLabelClick={() => {}}
            />
          </Block>
          <GroupPageContent
            {...pageContent}
            members={pipe(
              pageContent.fields.members,
              O.map((members) =>
                members.map((m) => ({
                  ...m,
                  selected: true,
                }))
              )
            )}
            onMemberClick={() => {}}
          />
          <EventList events={selectedNodes} />
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query GroupTemplateQuery($group: String!) {
    pageContent: markdownRemark(frontmatter: { uuid: { eq: $group } }) {
      ...GroupMarkdownRemark
    }

    events: allMarkdownRemark(
      filter: {
        fields: {
          collection: { eq: "events" }
          groups: { elemMatch: { uuid: { in: [$group] } } }
        }
      }
    ) {
      nodes {
        ...EventMarkdownRemark
      }
    }
  }
`

export default GroupTemplate
