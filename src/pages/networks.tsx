import React from "react"
import SEO from "../components/SEO"
import Layout from "../components/Layout"
import { Columns } from "react-bulma-components"
import { useStaticQuery, graphql } from "gatsby"
import { PageContentNode } from "../types/PageContent"
import Menu from "../components/Menu"

interface NetworksPageProps {
  navigate: (to: string) => void
}

interface Results {
  networks: { nodes: { id: string; name: string }[] }
  pageContent: PageContentNode
}

const NetworksPage = (props: NetworksPageProps) => {
  const { networks, pageContent }: Results = useStaticQuery(graphql`
    query NetworksPage {
      networks: allDirectory(
        filter: { relativeDirectory: { glob: "events/networks" } }
      ) {
        nodes {
          id
          name
        }
      }

      pageContent: markdownRemark(
        fileAbsolutePath: { glob: "**/pages/networks.md" }
      ) {
        html
        frontmatter {
          title
          path
        }
      }
    }
  `)

  const {
    frontmatter: { title },
    html,
  } = pageContent

  const items = networks.nodes.map(n => ({
    id: n.id,
    path: `/networks/${n.name}`,
    title: n.name,
    items: [],
  }))

  return (
    <Layout>
      <SEO title={title} />
      <Columns>
        <Columns.Column size={3}>
          <Menu items={items} />
        </Columns.Column>
        <Columns.Column size={9}>
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: html }}
          ></div>
        </Columns.Column>
      </Columns>
    </Layout>
  )
}

export default NetworksPage
