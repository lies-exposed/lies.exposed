import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { TopicPageContent } from "@components/TopicPageContent"
import EventList from "@components/lists/EventList"
import { getActors } from "@helpers/actor"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { ActorPageContentFileNode } from "@models/actor"
import { EventFileNode, EventData } from "@models/event"
import { TopicPageContentFileNode } from "@models/topic"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface TopicTimelineTemplateProps {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: TopicPageContentFileNode
    actors: {
      nodes: ActorPageContentFileNode[]
    }
    events: {
      nodes: EventFileNode[]
    }
  }
}

const TopicTimelineTemplate: React.FunctionComponent<TopicTimelineTemplateProps> = ({
  data,
}) => {
  return pipe(
    sequenceS(E.either)({
      events: t.array(EventFileNode).decode(data.events.nodes),
      actors: t.array(ActorPageContentFileNode).decode(data.actors.nodes),
      pageContent: TopicPageContentFileNode.decode(data.pageContent),
    }),
    E.map(({ pageContent, events, actors }) => {
      const actorsGetter = getActors(
        actors.map((a) => a.childMarkdownRemark.frontmatter)
      )
      return {
        pageContent,
        events: events.map((n) => {
          const eventDataNode: EventData = {
            ...n.childMarkdownRemark,
            frontmatter: {
              ...n.childMarkdownRemark.frontmatter,
              actors: pipe(
                n.childMarkdownRemark.frontmatter.actors,
                O.map(actorsGetter),
              ),
              groups: O.none,
              topic: [pageContent.childMarkdownRemark.frontmatter],
            },
          }

          return eventDataNode
        }),
      }
    }),
    E.fold(throwValidationErrors, ({ pageContent, events }) => {
      return (
        <Layout>
          <SEO title={pageContent.childMarkdownRemark.frontmatter.label} />
          <ContentWithSideNavigation items={eventsDataToNavigatorItems(events)}>
            <TopicPageContent {...pageContent.childMarkdownRemark} />
            <EventList events={events} />
          </ContentWithSideNavigation>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query TopicTemplateQuery($topic: String!) {
    pageContent: file(
      relativeDirectory: { eq: "topics" }
      name: { eq: $topic }
    ) {
      ...TopicPageContentFileNode
    }

    actors: allFile(
      filter: {
        sourceInstanceName: { eq: "content" }
        relativeDirectory: { eq: "actors" }
      }
    ) {
      nodes {
        ...ActorPageContentFileNode
      }
    }

    events: allFile(
      filter: {
        childMarkdownRemark: { frontmatter: { topic: { in: [$topic] } } }
      }
    ) {
      nodes {
        ...EventFileNode
      }
    }
  }
`
export default TopicTimelineTemplate
