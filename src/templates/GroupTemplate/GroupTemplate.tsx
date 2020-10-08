import { EventsNetwork } from "@components/Graph/EventsNetwork"
import { GroupPageContent } from "@components/GroupPageContent"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import SEO from "@components/SEO"
import EventList from "@components/lists/EventList"
import { EventMarkdownRemark } from "@models/event"
import { GroupMarkdownRemark } from "@models/group"
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
    pageContent: { childMarkdownRemark: GroupMarkdownRemark }
    events: {
      nodes: EventMarkdownRemark[]
    }
  }
}

const GroupTemplate: React.FC<GroupTemplatePageProps> = ({ data }) => {
  const minDate = O.none
  const maxDate = O.none

  return pipe(
    sequenceS(E.either)({
      pageContent: GroupMarkdownRemark.decode(
        data.pageContent.childMarkdownRemark
      ),
      events: pipe(
        t.array(EventMarkdownRemark).decode(data.events.nodes),
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
