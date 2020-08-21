import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import GroupList from "@components/lists/GroupList"
import { GroupMarkdownRemark } from "@models/group"
import { PageContentFileNode } from "@models/page"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { useStaticQuery, graphql, PageProps } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface Results {
  groups: { nodes: GroupMarkdownRemark[] }
  pageContent: PageContentFileNode
}

const GroupsPage: React.FC<PageProps> = ({ navigate }) => {
  const results = useStaticQuery<Results>(graphql`
    query GroupsPage {
      groups: allMarkdownRemark(
        filter: { fields: { collection: { eq: "groups" } } }
      ) {
        nodes {
          ...GroupMarkdownRemark
        }
      }

      pageContent: file(
        sourceInstanceName: { eq: "pages" }
        name: { eq: "groups" }
      ) {
        ...PageContentFileNode
      }
    }
  `)

  return pipe(
    sequenceS(E.either)({
      groups: t.array(GroupMarkdownRemark).decode(results.groups.nodes),
      pageContent: PageContentFileNode.decode(results.pageContent),
    }),
    E.fold(throwValidationErrors, ({ groups, pageContent }) => {
      const groupsItems = {
        itemId: "#groups-items",
        title: "Gruppi",
        subNav: results.groups.nodes.map((n) => ({
          itemId: `/groups/${n.frontmatter.uuid}`,
          title: n.frontmatter.name,
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
                ...a.frontmatter,
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
