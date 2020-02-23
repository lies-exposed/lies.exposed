import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import EventList from "@components/EventList"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { eventsDataToNavigatorItems } from "@helpers/event"
import { ActorPageContentFileNode, ActorFileNode } from "@models/actor"
import { EventFileNode, EventData } from "@models/event"
import { ImageFileNode } from "@models/image"
import { NetworkPageContentFileNode } from "@models/networks"
import renderMarkdownAST from "@utils//renderMarkdownAST"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { HeadingXLarge } from "baseui/typography"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface TopicTemplateProps {
  // `data` prop will be injected by the GraphQL query below.
  data: {
    pageContent: NetworkPageContentFileNode
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

export const TopicTemplate: React.FunctionComponent<TopicTemplateProps> = ({
  data,
}) => {
  return pipe(
    sequenceS(E.either)({
      events: t.array(EventFileNode).decode(data.events.nodes),
      actors: t.array(ActorPageContentFileNode).decode(data.actors.nodes),
      pageContent: NetworkPageContentFileNode.decode(data.pageContent),
    }),
    E.map(({ pageContent, events, actors }) => {
      return {
        pageContent,
        events: events.map(n => {
          const eventDataNode: EventData = {
            id: n.childMarkdownRemark.id,
            frontmatter: {
              ...n.childMarkdownRemark.frontmatter,
              links: O.fromNullable(n.childMarkdownRemark.frontmatter.links),
              cover: n.childMarkdownRemark.frontmatter.cover,
              actors: pipe(
                O.fromNullable(n.childMarkdownRemark.frontmatter.actors),
                O.map(actorIds =>
                  actors.reduce<ActorPageContentFileNode[]>((acc, n) => {
                    const actor = actorIds.includes(
                      n.childMarkdownRemark.frontmatter.username
                    )
                    return actor ? acc.concat(acc) : acc
                  }, [])
                )
              ),
              type: O.fromNullable(n.childMarkdownRemark.frontmatter.type),
            },
            fill: "#fff",
            topicLabel: "",
            topicSlug: "",
            topicFill: "#fff",
            htmlAst: n.childMarkdownRemark.htmlAst,
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
            <HeadingXLarge>
              {pageContent.childMarkdownRemark.frontmatter.title}
            </HeadingXLarge>
            {renderMarkdownAST(pageContent.childMarkdownRemark.htmlAst)}
            <EventList events={events} />
          </ContentWithSideNavigation>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query NetworkTopicTimelineTemplatePage(
    $relativeDirectory: String!
    $imagesRelativeDirectoryPath: String!
  ) {
    pageContent: file(
      relativeDirectory: { eq: $relativeDirectory }
      name: { eq: "index" }
    ) {
      childMarkdownRemark {
        frontmatter {
          title
          path
          date
          icon
          cover
          type
        }
        htmlAst
      }
    }
    actors: allFile(
      filter: {
        relativeDirectory: { glob: "events/actors/*" }
        name: { eq: "index" }
      }
    ) {
      nodes {
        id
        relativeDirectory
        childMarkdownRemark {
          frontmatter {
            title
            cover
            avatar
            username
          }
          htmlAst
        }
      }
    }

    events: allFile(
      filter: {
        relativeDirectory: { eq: $relativeDirectory }
        name: { ne: "index" }
      }
      sort: { order: DESC, fields: [childMarkdownRemark___frontmatter___date] }
    ) {
      nodes {
        relativeDirectory
        childMarkdownRemark {
          id
          frontmatter {
            title
            icon
            type
            date
            cover
            actors
            links
          }
          htmlAst
        }
      }
    }
    images: allFile(
      filter: { relativeDirectory: { eq: $imagesRelativeDirectoryPath } }
    ) {
      nodes {
        childImageSharp {
          fixed {
            src
          }
        }
        relativeDirectory
        relativePath
      }
    }
  }
`
export default TopicTemplate
