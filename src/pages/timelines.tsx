import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { ActorPageContentFileNode } from "@models/actor"
import { PageContentFileNode } from "@models/page"
import { TopicFileNode } from "@models/topic"
import * as A from "fp-ts/lib/Array"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"

interface Results {
  actors: { nodes: ActorPageContentFileNode[] }
  topics: { nodes: TopicFileNode[] }
  pageContent: PageContentFileNode
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
          ...ActorFileNode
        }
      }

      topics: allFile(
        filter: { relativePath: { glob: "events/networks/*/*/index.md" } }
      ) {
        nodes {
          ...TopicFileNode
        }
      }

      pageContent: file(relativePath: { eq: "pages/timelines.md" }) {
        ...PageContentFileNode
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


  return (
    <Layout>
      <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
      <ContentWithSideNavigation items={[actorItems, topicItems]}>
        <PageContent {...pageContent.childMarkdownRemark} />
      </ContentWithSideNavigation>
    </Layout>
  )
}

export default TimelinesPage
