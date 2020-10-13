import { ActorPageContent } from "@components/ActorPageContent"
import { EventsNetwork } from "@components/Graph/EventsNetwork"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import SEO from "@components/SEO"
import EventList from "@components/lists/EventList"
import { ActorMD } from "@models/actor"
import { EventMD } from "@models/event"
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
    pageContent: { childMdx: ActorMD }
    events: {
      nodes: EventMD[]
    }
  }
}

const ActorTemplate: React.FC<ActorTemplatePageProps> = ({ data }) => {
  const minDate = O.none
  const maxDate = O.none

  return pipe(
    sequenceS(E.either)({
      pageContent: ActorMD.decode(
        data.pageContent.childMdx
      ),
      events: pipe(
        t.array(EventMD).decode(data.events.nodes),
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
                events={events}
                selectedActorIds={[pageContent.frontmatter.uuid]}
                selectedGroupIds={[]}
                selectedTopicIds={[]}
                scale="all"
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
  query ActorTemplatePage($actorUUID: String!) {
    pageContent: file(
      sourceInstanceName: { eq: "actors" }
      name: { eq: $actorUUID }
    ) {
      childMdx {
        ...ActorMD
      }
    }

    events: allMdx(
      filter: { fields: { actors: { in: [$actorUUID] } } }
    ) {
      nodes {
        ...EventMDRemark
      }
    }
  }
`

export default ActorTemplate
