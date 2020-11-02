import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import { ProjectPageContent } from "@components/ProjectPageContent"
import SEO from "@components/SEO"
import { eventMetadataMapEmpty } from "@mock-data/events-metadata"
import { ProjectMD } from "@models/Project"
import { TransactionFrontmatter } from "@models/Transaction"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, PageProps } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface ProjectData {
  pageContent: { childMdx: unknown }
  funds: { nodes: unknown[] }
}

export interface ProjectTemplatePageProps extends PageProps<ProjectData> {}

const ProjectTemplateContainer: React.FC<ProjectTemplatePageProps> = ({
  data,
}) => {
  return pipe(
    sequenceS(E.either)({
      project: ProjectMD.decode(data.pageContent.childMdx),
      funds: t.array(TransactionFrontmatter).decode([]),
    }),
    E.fold(throwValidationErrors, ({ project, funds }) => {
      return (
        <Layout>
          <SEO title={project.frontmatter.name} />
          <MainContent>
            <ProjectPageContent {...project} metadata={eventMetadataMapEmpty} />
          </MainContent>
        </Layout>
      )
    })
  )
}

export const pageQuery = graphql`
  query ProjectTemplateQuery($projectUUID: String!) {
    pageContent: file(
      name: { eq: $projectUUID }
      sourceInstanceName: { eq: "projects" }
    ) {
      childMdx {
        ...ProjectMD
      }
    }

    events: allMdx(filter: { fields: { collection: { eq: "events" } } }) {
      nodes {
        ...EventMDRemark
      }
    }
  }
`

export default ProjectTemplateContainer
