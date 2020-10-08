import { ActorPageContent } from "@components/ActorPageContent"
import { EventsNetwork } from "@components/Graph/EventsNetwork"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import SEO from "@components/SEO"
import EventList from "@components/lists/EventList"
import { ActorMarkdownRemark } from "@models/actor"
import { EventMarkdownRemark } from "@models/event"
import { eventsInDateRange } from "@utils/event"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, navigate } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface ActorTemplatePageProps {
  navigate: typeof navigate
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: { childMarkdownRemark: ActorMarkdownRemark }
    events: {
      nodes: EventMarkdownRemark[]
    }
  }
}

const ActorTemplate: React.FC<ActorTemplatePageProps> = ({ data }) => {
  const minDate = O.none
  const maxDate = O.none

  return pipe(
    sequenceS(E.either)({
      pageContent: ActorMarkdownRemark.decode(
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
          <SEO title={pageContent.frontmatter.fullName} />
          <MainContent>
            <ActorPageContent {...pageContent} />
              <EventsNetwork
                width={1000}
                height={200}
                events={events}
                selectedActorIds={[pageContent.frontmatter.uuid]}
                selectedGroupIds={[]}
                selectedTopicIds={[]}
                scale="all"
                scalePoint={O.none}
                margin={{ vertical: 30, horizontal: 20 }}
              />
            

            <EventList events={events} />
          </MainContent>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query ActorTemplatePage($actorUUID: String!) {
    pageContent: file(
      sourceInstanceName: { eq: "actors" }
      name: { eq: $actorUUID }
    ) {
      childMarkdownRemark {
        ...ActorMarkdownRemark
      }
    }

    events: allMarkdownRemark(
      filter: { fields: { actors: { in: [$actorUUID] } } }
    ) {
      nodes {
        ...EventMarkdownRemark
      }
    }
  }
`

export default ActorTemplate
