import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import { ProjectPageContent } from "@components/ProjectPageContent"
import SEO from "@components/SEO"
import EventList from "@components/lists/EventList/EventList"
import { ProjectMD } from "@models/Project"
import { EventMD } from "@models/event"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, PageProps } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface ProjectData {
  pageContent: { childMdx: unknown }
  events: { nodes: unknown[] }
}

interface GroupTemplatePageProps extends PageProps<ProjectData> {}

const ProjectTemplate: React.FC<GroupTemplatePageProps> = ({ data }) => {


  return pipe(
    sequenceS(E.either)({
      project: ProjectMD.decode(data.pageContent.childMdx),
      events: t.array(EventMD).decode(data.events.nodes),
    }),
    E.fold(throwValidationErrors, ({ project, events }) => {
      return (
        <Layout>
          <SEO title={project.frontmatter.name} />
          <MainContent>
            <ProjectPageContent {...project} />
            <EventList events={events} />
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

export default ProjectTemplate
