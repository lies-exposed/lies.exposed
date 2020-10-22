import { AreaPageContent } from "@components/AreaPageContent"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import SEO from "@components/SEO"
import EventList from "@components/lists/EventList"
import { AreaMD } from "@models/area"
import { EventMD } from "@models/event"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, navigate } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface GroupTemplatePageProps {
  navigate: typeof navigate
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: { childMdx: unknown }
    events: { nodes: unknown[] }
  }
}

const AreaTemplate: React.FC<GroupTemplatePageProps> = ({ data }) => {
  return pipe(
    sequenceS(E.either)({
      area: AreaMD.decode(data.pageContent.childMdx),
      events: t.array(EventMD).decode(data.events.nodes),
    }),
    E.fold(throwValidationErrors, ({ area, events }) => {
      return (
        <Layout>
          <SEO title={area.frontmatter.label} />
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
          <MainContent>
            <AreaPageContent
              {...area}
              onGroupClick={() => {}}
              onTopicClick={() => {}}
            />
            <EventList events={events} />
          </MainContent>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query AreaTemplateQuery(
    $areaUUID: String!
    $groupUUIDs: [String!]
    $topicUUIDs: [String!]
  ) {
    pageContent: file(
      name: { eq: $areaUUID }
      sourceInstanceName: { eq: "areas" }
    ) {
      childMdx {
        ...AreaMD
      }
    }
    events: allMdx(
      filter: {
        fields: {
          collection: { eq: "events" }
          groups: { in: $groupUUIDs }
          topics: { in: $topicUUIDs }
        }
      }
    ) {
      nodes {
        ...EventMDRemark
      }
    }
  }
`

export default AreaTemplate
