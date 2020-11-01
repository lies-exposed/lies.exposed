import { GroupPageContent } from "@components/GroupPageContent"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import SEO from "@components/SEO"
import { EventSlider } from "@components/sliders/EventSlider"
import { eventsInDateRange } from "@helpers/event"
import { UncategorizedMD } from "@models/events/UncategorizedEvent"
import { GroupMD } from "@models/group"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from 'fp-ts/lib/Either'
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, PageProps } from "gatsby"
import * as t from 'io-ts'
import * as React from 'react'

interface GroupTemplateData {
  pageContent: { childMdx: unknown}
  events: { nodes: Array<{ childMdx: unknown}>}
}

const GroupTemplateContainer: React.FC<PageProps<GroupTemplateData>> = ({ data, navigate }) => {
  const minDate = O.none
  const maxDate = O.none

  return pipe(
    sequenceS(E.either)({
      pageContent: GroupMD.decode(data.pageContent.childMdx),
      events: pipe(
        t.array(UncategorizedMD).decode(data.events.nodes.map(n => n.childMdx)),
        E.map(eventsInDateRange({ minDate, maxDate }))
      ),
    }),
    E.fold(throwValidationErrors, ({ pageContent, events }) => {
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
          <MainContent>
            <GroupPageContent
              {...pageContent}
              events={events}
              funds={[]}
              projects={[]}
              onMemberClick={async (a) => {
                await navigate(`/actors/${a.uuid}`)
              }}
            />
            <EventSlider events={events}/>
          </MainContent>
        </Layout>
      )
    })
  )
}

export default GroupTemplateContainer

export const pageQuery = graphql`
  query GroupTemplateQuery($group: String!) {
    pageContent: file(
      name: { eq: $group }
      sourceInstanceName: { eq: "groups" }
    ) {
      childMdx {
        ...GroupMD
      }
    }

    events: allFile(
      filter: {
        sourceInstanceName: { eq: "uncategorized-events" }
        childMdx: { fields: { groups: { in: [$group] } } }
      }
    ) {
      nodes {
        childMdx {
          ...EventMDRemark
        }
      }
    }
  }
`
