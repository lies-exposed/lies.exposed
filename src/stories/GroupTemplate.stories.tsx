import { events } from "@mock-data/events"
import { firstGroup } from "@mock-data/groups"
import { Meta, Story } from "@storybook/react/types-6-0"
import GroupTemplate, {

  GroupTemplatePageProps
} from "@templates/GroupTemplate/GroupTemplate"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Templates/GroupTemplate",
  component: GroupTemplate,
}

export default meta

const Template: Story<GroupTemplatePageProps> = (props) => {
  return <GroupTemplate {...props} />
}

const GroupTemplatePageExample = Template.bind({})

const args: GroupTemplatePageProps = {
  group: {
    frontmatter: firstGroup,
    body: null,
    tableOfContents: { items: undefined },
    timeToRead: O.none,
  },
  events: events.map((e) => ({
    body: null,
    frontmatter: e,
    timeToRead: O.none,
    tableOfContents: { items: undefined },
  })),
}

GroupTemplatePageExample.args = args

export { GroupTemplatePageExample }
