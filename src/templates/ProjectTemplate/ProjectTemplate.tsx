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
  return <ProjectPageContent {...project} funds={funds} />
}
