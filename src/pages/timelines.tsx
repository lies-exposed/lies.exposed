import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import SEO from "@components/SEO"
import { ActorPageContentFileNode } from "@models/actor"
import { TopicFileNode } from "@models/topic"
import renderMarkdownAST from "@utils/renderMarkdownAST"
import * as A from "fp-ts/lib/Array"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"

interface PageContentNode {
  title: string
  htmlAst: object
}

interface Results {
  actors: { nodes: ActorPageContentFileNode[] }
  topics: { nodes: TopicFileNode[] }
  pageContent: { nodes: PageContentNode[] }
}

const TimelinesPage = (): React.ReactElement => {
  const { actors, topics, pageContent }: Results = useStaticQuery(graphql`
    query TimelinesPage {
      actors: allFile(
        filter: {
          relativeDirectory: { glob: "events/actors/*" }
          name: { eq: "index" }
        }
      ) {
        nodes {
          relativeDirectory
          name
          id
          childMarkdownRemark {
            id
            frontmatter {
              title
              path
              username
            }
          }
        }
      }

      topics: allFile(
        filter: { relativePath: { glob: "events/networks/*/*/index.md" } }
      ) {
        nodes {
          relativeDirectory
          childMarkdownRemark {
            frontmatter {
              title
              slug
            }
          }
        }
      }

      pageContent: allMarkdownRemark(
        filter: { frontmatter: { path: { eq: "/timelines" } } }
      ) {
        nodes {
          frontmatter {
            title
          }
          htmlAst
        }
      }
    }
  `)

  const actorItems = {
    itemId: "#actors-items",
    title: "Attori",
    subNav: actors.nodes.map(n => ({
      itemId: `/timelines/${n.childMarkdownRemark.frontmatter.username}`,
      title: n.childMarkdownRemark.frontmatter.title,
      subNav: [],
    })),
  }

  const topicItems = {
    itemId: "#topics-items",
    title: "Topic",
    subNav: topics.nodes.map(t => {
      const networkName = A.takeRight(2)(t.relativeDirectory.split("/"))[0]
      const id = `${networkName}/${t.childMarkdownRemark.frontmatter.slug}`
      return {
        itemId: `/timelines/${id}`,
        title: `${networkName} - ${t.childMarkdownRemark.frontmatter.title}`,
        subNav: [],
      }
    }),
  }

  const { title, htmlAst } = pageContent.nodes[0]

  return (
    <Layout>
      <SEO title={title} />
      <ContentWithSideNavigation items={[actorItems, topicItems]}>
        {renderMarkdownAST(htmlAst)}
      </ContentWithSideNavigation>
    </Layout>
  )
}

export default TimelinesPage
