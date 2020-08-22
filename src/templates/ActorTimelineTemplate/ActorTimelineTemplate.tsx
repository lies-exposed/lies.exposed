import { ActorPageContent } from "@components/ActorPageContent"
import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import EventList from "@components/lists/EventList"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { ActorMarkdownRemark } from "@models/actor"
import { EventMarkdownRemark } from "@models/event"
import { TopicMarkdownRemark } from "@models/topic"
import { ordEventFileNodeDate } from "@utils/event"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as A from "fp-ts/lib/Array"
import * as E from "fp-ts/lib/Either"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, navigate } from "gatsby"
import * as t from "io-ts"
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
    sequenceS(E.either)({
      pageContent: ActorMarkdownRemark.decode(data.pageContent),
      // actors: t.array(ActorMarkdownRemark).decode(data.actors.nodes),
      // topics: t.array(TopicMarkdownRemark).decode(data.topics.nodes),
      events: t.array(EventMarkdownRemark).decode(data.events.nodes),
    }),
    E.map(({ pageContent, events }) => {
      return {
        pageContent,
        events: A.sortBy([Ord.getDualOrd(ordEventFileNodeDate)])(events),
      }
    }),
    E.fold(throwValidationErrors, ({ pageContent, events }) => {
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
          <ContentWithSideNavigation items={eventsDataToNavigatorItems(events)}>
            <ActorPageContent {...pageContent} />
            <EventList events={events} />
          </ContentWithSideNavigation>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query ActorTimelineTemplatePage($actorUUID: String!) {
    pageContent: markdownRemark(frontmatter: { uuid: { eq: $actorUUID } }) {
      frontmatter {
        ...Actor
      }
    }

    actors: allMarkdownRemark(
      filter: { fields: { collection: { eq: "actors" } } }
    ) {
      nodes {
        ...ActorMarkdownRemark
      }
    }

    topics: allMarkdownRemark(
      filter: { fields: { collection: { eq: "topics" } } }
    ) {
      nodes {
        ...TopicMarkdownRemark
      }
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
