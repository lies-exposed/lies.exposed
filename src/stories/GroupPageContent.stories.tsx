import {
  GroupPageContent,
  GroupPageContentProps,
} from "@components/GroupPageContent"
import { events } from "@mock-data/events"
import { firstGroup } from "@mock-data/groups"
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
  onMemberClick: () => {},
}

GroupPageContentExample.args = args

export { GroupPageContentExample }
