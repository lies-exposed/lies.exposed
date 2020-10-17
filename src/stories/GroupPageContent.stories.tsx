import {
  GroupPageContent,
  GroupPageContentProps,
} from "@components/GroupPageContent"
import { events } from "@mock-data/events"
import { funds } from "@mock-data/funds"
import { firstGroup } from "@mock-data/groups"
import { projects } from "@mock-data/projects"
import { Meta, Story } from "@storybook/react/types-6-0"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Components/Pages/GroupPageContent",
  component: GroupPageContent,
}

export default meta

const Template: Story<GroupPageContentProps> = (props) => {
  return <GroupPageContent {...props} />
}

const GroupPageContentExample = Template.bind({})

const groupFunds = funds.filter(
  (f) => f.by.__type === "Group" && f.by.group.uuid === firstGroup.uuid
)
const fundedProjectIds = groupFunds.map( f => f.project.uuid)

console.log(groupFunds)
const args: GroupPageContentProps = {
  frontmatter: firstGroup,
  body: null,
  tableOfContents: { items: undefined },
  timeToRead: O.none,
  events: events.map((e) => ({
    frontmatter: e,
    body: null,
    timeToRead: O.none,
    tableOfContents: { items: undefined },
  })),
  projects: projects.filter((p) => fundedProjectIds.includes(p.uuid)),
  funds: groupFunds,
  onMemberClick: () => {},
}

GroupPageContentExample.args = args

export { GroupPageContentExample }
