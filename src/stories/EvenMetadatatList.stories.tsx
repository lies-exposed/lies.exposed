import {
  EventMetadataList,
  EventMetadataListProps,
} from "@components/lists/EventMetadataList"
import { badGroup, goodGroup } from "@mock-data/groups"
import { firstGoodProject } from "@mock-data/projects"
import { Meta, Story } from "@storybook/react/types-6-0"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Components/Lists/EventMetadataList",
  component: EventMetadataList,
}

export default meta

const Template: Story<EventMetadataListProps> = (props) => {
  return <EventMetadataList {...props} />
}

const EventMetadataListExample = Template.bind({})

const args: EventMetadataListProps = {
  metadata: [
    {
      type: "Protest",
      by: [{ __type: "Group", group: goodGroup }],
      for: { __type: "ForProject", uuid: firstGoodProject.uuid },
      images: O.none,
    },
    {
      type: "ProjectFund",
      by: { __type: 'Group', group: badGroup},
      project: firstGoodProject
    }
  ],
}

EventMetadataListExample.args = args

export { EventMetadataListExample as EventMetadataList }
