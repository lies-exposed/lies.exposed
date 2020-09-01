import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { TopicPageContent } from "@components/TopicPageContent"
import EventList from "@components/lists/EventList"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { EventMarkdownRemark } from "@models/event"
import { TopicMarkdownRemark } from "@models/topic"
import { ordEventData } from "@utils/event"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as A from 'fp-ts/lib/Array'
import * as E from "fp-ts/lib/Either"
import * as Ord from 'fp-ts/lib/Ord'
import { pipe } from "fp-ts/lib/pipeable"
import { graphql } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface TopicTimelineTemplateProps {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: { childMarkdownRemark: TopicMarkdownRemark }
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
      pageContent: TopicMarkdownRemark.decode(
        data.pageContent.childMarkdownRemark
      ),
    }),
    E.fold(throwValidationErrors, ({ pageContent, events }) => {
      return (
        <Layout>
          <SEO title={pageContent.frontmatter.label} />
          <ContentWithSideNavigation items={eventsDataToNavigatorItems(events)}>
            <TopicPageContent {...pageContent} />
            <EventList events={A.sort(Ord.getDualOrd(ordEventData))(events)} />
          </ContentWithSideNavigation>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query TopicTemplateQuery($topic: String!) {
    pageContent: file(
      sourceInstanceName: { eq: "topics" }
      name: { eq: $topic }
    ) {
      childMarkdownRemark {
        ...TopicMarkdownRemark
      }
    }

    events: allMarkdownRemark(
      filter: {
        fields: { collection: { eq: "events" }, topics: { in: [$topic] } }
      }
    ) {
      nodes {
        ...EventMarkdownRemark
      }
    }
  }
`
export default TopicTimelineTemplate
