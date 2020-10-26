import { EventPageContent } from "@components/EventPageContent"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import SEO from "@components/SEO"
import { EventMD } from "@models/events/EventMetadata"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, navigate } from "gatsby"
import React from "react"

interface GroupTemplatePageProps {
  navigate: typeof navigate
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: { childMdx: unknown }
  }
}

const EventTemplate: React.FC<GroupTemplatePageProps> = ({ data }) => {
  return pipe(
    EventMD.decode(data.pageContent.childMdx),
    E.fold(throwValidationErrors, (pageContent) => {
      return (
        <Layout>
          <SEO title={pageContent.frontmatter.title} />
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
            <EventPageContent {...pageContent} />
          </MainContent>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query EventTemplateQuery($eventUUID: String!) {
    pageContent: file(
      name: { eq: $eventUUID }
      sourceInstanceName: { eq: "events" }
    ) {
      childMdx {
        ...EventMDRemark
      }
    }
  }
`

export default EventTemplate
