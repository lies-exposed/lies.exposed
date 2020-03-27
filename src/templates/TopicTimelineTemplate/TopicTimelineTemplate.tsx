import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import EventList from "@components/EventList"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { TopicPageContent } from "@components/TopicPageContent"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { ActorPageContentFileNode, ActorFileNode } from "@models/actor"
import { EventFileNode, EventData } from "@models/event"
import { ImageFileNode } from "@models/image"
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
      nodes: ActorFileNode[]
    }
    events: {
      nodes: EventFileNode[]
    }
    images: {
      nodes: ImageFileNode[]
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
      return {
        pageContent,
        events: events.map(n => {
          const eventDataNode: EventData = {
            ...n.childMarkdownRemark,
            frontmatter: {
              ...n.childMarkdownRemark.frontmatter,
              links: O.fromNullable(n.childMarkdownRemark.frontmatter.links),
              cover: n.childMarkdownRemark.frontmatter.cover,
              actors: pipe(
                n.childMarkdownRemark.frontmatter.actors,
                O.map(actorIds =>
                  actors.reduce<ActorPageContentFileNode[]>((acc, n) => {
                    const actor = actorIds.includes(
                      n.childMarkdownRemark.frontmatter.username
                    )
                    return actor ? acc.concat(n) : acc
                  }, [])
                )
              ),
              topic: O.some(pageContent),
              type: O.fromNullable(n.childMarkdownRemark.frontmatter.type),
            }
          }

          return eventDataNode
        }),
      }
    }),
    E.fold(throwValidationErrors, ({ pageContent, events }) => {
      return (
        <Layout>
          <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
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
  query TopicTimelineTemplateQuery($topic: String!) {
    pageContent: file(
      relativeDirectory: { eq: "topics" }
      name: { eq: $topic }
    ) {
      ...TopicPageContentFileNode
    }

    actors: allFile(
      filter: { relativeDirectory: { eq: "actors" } }
    ) {
      nodes {
        ...ActorPageContentFileNode
      }
    }

    events: allFile(
      filter: {
        childMarkdownRemark: { frontmatter: { topic: { eq: $topic } } }
      }
    ) {
      nodes {
        ...EventFileNode
      }
    }
  }
`
export default TopicTimelineTemplate
