import {
  ProjectPageContent,
  ProjectPageContentProps,
} from "@components/ProjectPageContent"
import { funds } from "@mock-data/funds"
import { firstProject } from "@mock-data/projects"
import { Meta, Story } from "@storybook/react/types-6-0"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Components/Pages/ProjectPageContent",
  component: ProjectPageContent,
}

export default meta

const Template: Story<ProjectPageContentProps> = (props) => {
  return <ProjectPageContent {...props} />
}

const ProjectPageContentExample = Template.bind({})

const args: ProjectPageContentProps = {
  frontmatter: firstProject,
  body: null,
  tableOfContents: { items: undefined },
  timeToRead: O.none,
  funds,
}

ProjectPageContentExample.args = args

export { ProjectPageContentExample }
