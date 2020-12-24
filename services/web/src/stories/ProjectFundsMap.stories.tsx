import { ProjectFundsMap, ProjectFundsMapProps } from "@components/Graph/ProjectFundsMap"
import { firstGoodProject } from "@mock-data/projects"
import { Meta, Story } from "@storybook/react/types-6-0"
import * as React from "react"

const meta: Meta = {
  title: "Components/Graph/ProjectFundsMap",
  component: ProjectFundsMap,
}

export default meta

const Template: Story<ProjectFundsMapProps> = (props) => {
  return <ProjectFundsMap {...props} />
}

const ProjectFundsMapExample = Template.bind({})

const args: ProjectFundsMapProps = {
  project: firstGoodProject,
}

ProjectFundsMapExample.args = args

export { ProjectFundsMapExample }
