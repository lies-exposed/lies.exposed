import { funds } from "@mock-data/funds"
import { firstProject } from "@mock-data/projects"
import { Meta, Story } from "@storybook/react/types-6-0"
import {
  ProjectTemplate,
  ProjectTemplatePageProps,
} from "@templates/ProjectTemplate/ProjectTemplate"
import * as O from 'fp-ts/lib/Option'
import * as React from "react"

const meta: Meta = {
  title: "Templates/ProjectTemplate",
  component: ProjectTemplate,
}

export default meta

const Template: Story<ProjectTemplatePageProps> = (props) => {
  return <ProjectTemplate {...props} />
}

const ProjectTemplatePageExample = Template.bind({})

const args: ProjectTemplatePageProps = {
  project: {
    frontmatter: firstProject,
    body: null,
    tableOfContents: { items: undefined },
    timeToRead: O.none,
  },
  funds,
}

ProjectTemplatePageExample.args = args

export { ProjectTemplatePageExample }
