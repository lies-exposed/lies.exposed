import { ContentWithSidebar } from "@components/ContentWithSidebar"
import { Layout } from "@components/Layout"
import { ProjectListItem } from "@components/lists/ProjectList"
import { PageContent } from "@components/PageContent"
import SearchableInput from "@components/SearchableInput"
import SEO from "@components/SEO"
import { TableOfContents } from "@components/TableOfContents"
import { PageMD } from "@models/page"
import { ProjectFrontmatter } from "@models/Project"
import { navigateTo } from "@utils/links"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { PageProps } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface Results {
  pageContent: { childMdx: unknown }
  projects: { nodes: Array<{ childMdx: ProjectFrontmatter }> }
}

const ProjectsPage: React.FC<PageProps> = (props) => {
  // const data: Results = useStaticQuery(graphql`
  //   query ProjectsPage {
  //     pageContent: file(
  //       sourceInstanceName: { eq: "pages" }
  //       name: { eq: "projects" }
  //     ) {
  //       childMdx {
  //         ...PageMD
  //       }
  //     }

  //     projects: allProjectFrontmatter {
  //       nodes {
  //         ...Project
  //       }
  //     }
  //   }
  // `)

  const data = {
    pageContent: { childMdx: undefined },
    projects: { nodes: [] },
  }

  return pipe(
    sequenceS(E.either)({
      page: PageMD.decode(data.pageContent.childMdx),
      projects: t.array(ProjectFrontmatter).decode(data.projects.nodes),
    }),
    E.fold(throwValidationErrors, ({ page, projects }) => {
      return (
        <Layout>
          <SEO title={page.frontmatter.title} />
          <ContentWithSidebar
            sidebar={pipe(
              page.tableOfContents,
              O.mapNullable((t) => t.items),
              O.fold(
                () => <div />,
                (items) => <TableOfContents items={items} />
              )
            )}
          >
            <PageContent {...page} />
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
