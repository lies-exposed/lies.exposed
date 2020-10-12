import { EventsNetwork } from "@components/Graph/EventsNetwork"
import { GroupPageContent } from "@components/GroupPageContent"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import SEO from "@components/SEO"
import EventList from "@components/lists/EventList"
import { EventMD } from "@models/event"
import { GroupMdx } from "@models/group"
import { eventsInDateRange } from "@utils/event"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, navigate } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface GroupTemplatePageProps {
  navigate: typeof navigate
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: { childMdx: GroupMdx }
    events: {
      nodes: Array<{ childMdx: EventMD }>
    }
  }
}

const GroupTemplate: React.FC<GroupTemplatePageProps> = ({ data }) => {
  const minDate = O.none
  const maxDate = O.none

  return pipe(
    sequenceS(E.either)({
      pageContent: GroupMdx.decode(data.pageContent.childMdx),
      events: pipe(
        t.array(EventMD).decode(data.events.nodes.map(n => n.childMdx)),
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
              onMemberClick={async (a) => {
                await navigate(`/actors/${a.uuid}`)
              }}
            />
            <EventsNetwork
              events={events}
              selectedGroupIds={[pageContent.frontmatter.uuid]}
              selectedActorIds={[]}
              selectedTopicIds={[]}
              margin={{ vertical: 20, horizontal: 20 }}
              height={200}
              width={1000}
              scale={"all"}
              scalePoint={O.none}
            />
            <EventList events={events} />
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
      childMdx {
        ...GroupMD
      }
    }

    events: allFile(
      filter: {
        sourceInstanceName: { eq: "events" }
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

export default GroupTemplate
