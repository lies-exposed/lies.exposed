import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { TopicPageContent } from "@components/TopicPageContent"
import EventList from "@components/lists/EventList"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { ActorMarkdownRemark } from "@models/actor"
import { EventMarkdownRemark } from "@models/event"
import { TopicMarkdownRemark } from "@models/topic"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface TopicTimelineTemplateProps {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: TopicMarkdownRemark
    actors: {
      nodes: ActorMarkdownRemark[]
    }
    events: {
      nodes: EventMarkdownRemark[]
    }
  }
}

const TopicTimelineTemplate: React.FunctionComponent<TopicTimelineTemplateProps> = ({
  data,
}) => {
  return pipe(
    sequenceS(E.either)({
      events: t.array(EventMarkdownRemark).decode(data.events.nodes),
      pageContent: TopicMarkdownRemark.decode(data.pageContent),
    }),
    E.fold(throwValidationErrors, ({ pageContent, events }) => {
      return (
        <Layout>
          <SEO title={pageContent.frontmatter.label} />
          <ContentWithSideNavigation items={eventsDataToNavigatorItems(events)}>
            <TopicPageContent {...pageContent} />
            <EventList events={events} />
          </ContentWithSideNavigation>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query TopicTemplateQuery($topic: String!) {
    pageContent: markdownRemark(frontmatter: { uuid: { eq: $topic } }) {
      frontmatter {
        ...Topic
      }
    }

    events: allMarkdownRemark(
      filter: {
        fields: {
          collection: { eq: "events" }
          topics: { elemMatch: { uuid: { in: [$topic] } } }
        }
      }
    ) {
      nodes {
        ...EventMarkdownRemark
      }
    }
  }
`
export default TopicTimelineTemplate
