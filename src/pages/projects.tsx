import { ContentWithSidebar } from "@components/ContentWithSidebar"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import SearchableInput from "@components/SearchableInput"
import { TableOfContents } from "@components/TableOfContents"
import { ProjectListItem } from "@components/lists/ProjectList"
import { ProjectFrontmatter } from "@models/Project"
import { PageContentFileNode } from "@models/page"
import { navigateTo } from "@utils/links"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { useStaticQuery, graphql, PageProps } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface Results {
  pageContent: unknown
  projects: { nodes: Array<{ childMdx: ProjectFrontmatter }> }
}

const ProjectsPage: React.FC<PageProps> = (props) => {
  const data: Results = useStaticQuery(graphql`
    query ProjectsPage {
      pageContent: file(
        sourceInstanceName: { eq: "pages" }
        name: { eq: "projects" }
      ) {
        ...PageFileNode
      }

      projects: allProjectFrontmatter {
        nodes {
          ...Project
        }
      }
    }
  `)
  
  return pipe(
    sequenceS(E.either)({
      page: PageContentFileNode.decode(data.pageContent),
      projects: t.array(ProjectFrontmatter).decode(data.projects.nodes),
    }),
    E.fold(throwValidationErrors, ({ page, projects }) => {
      return (
        <Layout>
          <SEO title={page.childMdx.frontmatter.title} />
          <ContentWithSidebar
            sidebar={pipe(
              O.fromNullable(page.childMdx.tableOfContents.items),
              O.fold(
                () => <div />,
                (items) => <TableOfContents items={items} />
              )
            )}
          >
            <PageContent {...page.childMdx} />
            <SearchableInput
              items={projects.map((a) => ({
                ...a,
                selected: true,
              }))}
              selectedItems={[]}
              getValue={(g) => g.name}
              onSelectItem={async (item) => {
                await navigateTo(props.navigate, "projects", item)
              }}
              onUnselectItem={() => {}}
              itemRenderer={(item, itemProps, index) => (
                <ProjectListItem
                  item={item}
                  index={index}
                  avatarScale="scale1600"
                  onClick={async (item) => {
                    await navigateTo(props.navigate, "projects", item)
                  }}
                />
              )}
            />
          </ContentWithSidebar>
        </Layout>
      )
    })
  )
}

export default ProjectsPage
