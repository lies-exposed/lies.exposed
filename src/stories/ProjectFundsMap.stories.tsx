import { ProjectFundsMap, ProjectFundsMapProps } from "@components/Graph/ProjectFundsMap"
import { funds } from "@mock-data/funds"
import { project } from "@mock-data/project"
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
  project: project,
  funds: funds
}

ProjectFundsMapExample.args = args

export { ProjectFundsMapExample }
