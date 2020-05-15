import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { PageContentFileNode } from "@models/page"
import { TopicFileNode } from "@models/topic"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"

interface Results {
  topics: { nodes: TopicFileNode[] }
  pageContent: PageContentFileNode
}

const TopicsPage: React.FC = () => {
  const { topics, pageContent } = useStaticQuery<Results>(graphql`
    query TopicsPage {

      pageContent: file(relativeDirectory: { eq: "pages" } name: { eq: "topics"}) {
        ...PageContentFileNode
      }

      topics: allFile(filter: { relativeDirectory: { eq: "topics" } }) {
        nodes {
          ...TopicFileNode
        }
      }
    }
  `)

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

  return (
    <Layout>
      <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
      <ContentWithSideNavigation items={[topicItems]}>
        <PageContent {...pageContent.childMarkdownRemark} />
      </ContentWithSideNavigation>
    </Layout>
  )
}

export default TopicsPage
