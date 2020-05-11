import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { ActorPageContentFileNode } from "@models/actor"
import { GroupFileNode } from "@models/group"
import { PageContentFileNode } from "@models/page"
import { TopicFileNode } from "@models/topic"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"

interface Results {
  actors: { nodes: ActorPageContentFileNode[] }
  topics: { nodes: TopicFileNode[] }
  groups: { nodes: GroupFileNode[]}
  pageContent: PageContentFileNode
}

const TimelinesPage = (): React.ReactElement => {
  const { actors, topics, groups, pageContent }: Results = useStaticQuery(graphql`
    query TimelinesPage {
      actors: allFile(
        filter: {
          sourceInstanceName: { eq: "data" }
          relativeDirectory: { eq: "actors" }
        }
      ) {
        nodes {
          ...ActorPageContentFileNode
        }
      }

      topics: allFile(filter: { relativeDirectory: { eq: "topics" } }) {
        nodes {
          ...TopicFileNode
        }
      }

      groups: allFile(filter: { relativeDirectory: { eq: "groups" } }) {
        nodes {
          ...GroupPageContentFileNode
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
      itemId: `/actors/${n.childMarkdownRemark.frontmatter.username}`,
      title: n.childMarkdownRemark.frontmatter.fullName,
      subNav: [],
    })),
  }

  const topicItems = {
    itemId: "#topics-items",
    title: "Topics",
    subNav: topics.nodes.map(t => {
      return {
        itemId: `/topics/${t.childMarkdownRemark.frontmatter.slug}`,
        title: t.childMarkdownRemark.frontmatter.label,
        subNav: [],
      }
    }),
  }

  const groupItems = {
    itemId: '#groups-items',
    title: 'Groups',
    subNav: groups.nodes.map(g => ({
      itemId: `/topics/${g.name}`,
      title: g.childMarkdownRemark.frontmatter.name,
      subNav: [],
    }))
  
  }

  return (
    <Layout>
      <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
      <ContentWithSideNavigation items={[actorItems, topicItems, groupItems]}>
        <PageContent {...pageContent.childMarkdownRemark} />
      </ContentWithSideNavigation>
    </Layout>
  )
}

export default TimelinesPage
