import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { GroupFileNode } from "@models/group"
import { PageContentFileNode } from "@models/page"
import { TopicFileNode } from "@models/topic"
import { useStaticQuery, graphql, PageProps } from "gatsby"
import React from "react"

interface Results {
  groups: { nodes: GroupFileNode[]}
  topics: { nodes: TopicFileNode[] }
  pageContent: PageContentFileNode
}

const GroupsPage: React.FC<PageProps> = (props) => {

  const { groups, pageContent }: Results = useStaticQuery(graphql`
    query GroupsPage {
      groups: allFile(
        filter: {
          sourceInstanceName: { eq: "data" }
          relativeDirectory: { eq: "groups" }
        }
      ) {
        nodes {
          ...GroupPageContentFileNode
        }
      }

      topics: allFile(filter: { relativeDirectory: { eq: "topics" } }) {
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
    itemId: "#groups-items",
    title: "Gruppi",
    subNav: groups.nodes.map(n => ({
      itemId: `/groups/${n.name}`,
      title: n.childMarkdownRemark.frontmatter.name,
      subNav: [],
    })),
  }


  return (
    <Layout>
      <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
      <ContentWithSideNavigation items={[actorItems]}>
        <PageContent {...pageContent.childMarkdownRemark} />
      </ContentWithSideNavigation>
    </Layout>
  )
}

export default GroupsPage
