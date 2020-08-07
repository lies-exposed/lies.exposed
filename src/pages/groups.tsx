import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import GroupList from "@components/GroupList"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { GroupFileNode } from "@models/group"
import { PageContentFileNode } from "@models/page"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from 'fp-ts/lib/Either'
import { pipe } from "fp-ts/lib/pipeable"
import { useStaticQuery, graphql, PageProps } from "gatsby"
import * as t from 'io-ts'
import React from "react"

interface Results {
  groups: { nodes: GroupFileNode[] }
  pageContent: PageContentFileNode
}

const GroupsPage: React.FC<PageProps> = ({ navigate }) => {
  const results: Results = useStaticQuery(graphql`
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

  return pipe(
    sequenceS(E.either)({
      groups: t.array(GroupFileNode).decode(results.groups.nodes),
      pageContent: PageContentFileNode.decode(results.pageContent)
    }),
    E.fold(throwValidationErrors, ({ groups, pageContent}) => {
      const groupsItems = {
        itemId: "#groups-items",
        title: "Gruppi",
        subNav: results.groups.nodes.map((n) => ({
          itemId: `/groups/${n.childMarkdownRemark.frontmatter.uuid}`,
          title: n.childMarkdownRemark.frontmatter.name,
          subNav: [],
        })),
      }
  
    
      return (
        <Layout>
          <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
          <ContentWithSideNavigation items={[groupsItems]}>
            <PageContent {...pageContent.childMarkdownRemark} />
            <GroupList
              groups={groups.map((a) => ({
                ...a.childMarkdownRemark.frontmatter,
                selected: false,
              }))}
              onGroupClick={async (a) => {
                await navigate(`/groups/${a.uuid}`)
              }}
              avatarScale="scale1600"
            />
          </ContentWithSideNavigation>
        </Layout>
      )
    })
  )

  
}

export default GroupsPage
