import { MainContent } from "@components/MainContent"
import { ProjectPageContent } from "@components/ProjectPageContent"
import { ProjectMD } from "@models/Project"
import { FundFrontmatter } from "@models/events/Fund"
import React from "react"

export interface ProjectTemplatePageProps {
  project: ProjectMD
  funds: FundFrontmatter[]
}

export const ProjectTemplate: React.FC<ProjectTemplatePageProps> = ({
  project,
  funds,
}) => {
  return (
    <MainContent>
      <ProjectPageContent {...project} funds={funds} />
      {/* <EventList events={events} /> */}
    </MainContent>
  )
}
