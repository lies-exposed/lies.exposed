import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { ActorPageContentFileNode } from "@models/actor"
import { PageContentFileNode } from "@models/page"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"

interface Results {
  actors: { nodes: ActorPageContentFileNode[] }
  pageContent: PageContentFileNode
}

const ActorsPage = (): React.ReactElement => {
  const { actors, pageContent }: Results = useStaticQuery(graphql`
    query ActorsPage {
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

      pageContent: file(relativePath: { eq: "pages/actors.md" }) {
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


  return (
    <Layout>
      <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
      <ContentWithSideNavigation items={[actorItems]}>
        <PageContent {...pageContent.childMarkdownRemark} />
      </ContentWithSideNavigation>
    </Layout>
  )
}

export default ActorsPage
