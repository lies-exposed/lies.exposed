import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { GroupFileNode } from "@models/group"
import { PageContentFileNode } from "@models/page"
import { useStaticQuery, graphql, PageProps } from "gatsby"
import React from "react"

interface Results {
  groups: { nodes: GroupFileNode[]}
  pageContent: PageContentFileNode
}

const GroupsPage: React.FC<PageProps> = (props) => {

  const { groups, pageContent }: Results = useStaticQuery(graphql`
    query GroupsPage {
      groups: allFile(
        filter: {
          sourceInstanceName: { eq: "content" }
          relativeDirectory: { eq: "groups" }
        }
      ) {
        nodes {
          ...GroupPageContentFileNode
        }
      }

      pageContent: file(relativePath: { eq: "pages/groups.md" }) {
        ...PageContentFileNode
      }
    }
  `)


  const groupsItems = {
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
      <ContentWithSideNavigation items={[groupsItems]}>
        <PageContent {...pageContent.childMarkdownRemark} />
      </ContentWithSideNavigation>
    </Layout>
  )
}

export default GroupsPage
