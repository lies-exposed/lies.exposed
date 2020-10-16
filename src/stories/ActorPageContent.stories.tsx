import {
  ActorPageContent,
  ActorPageContentProps
} from "@components/ActorPageContent"
import { firstActor } from "@mock-data/actors"
import { Meta, Story } from "@storybook/react/types-6-0"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Components/Pages/ActorPageContent",
  component: ActorPageContent,
}

export default meta

const Template: Story<ActorPageContentProps> = (props) => {
  return <ActorPageContent {...props} />
}

const ActorPageExample = Template.bind({})

const args: ActorPageContentProps = {
  frontmatter: firstActor,
  body: null,
  tableOfContents: { items: undefined },
  timeToRead: O.none,
}

ActorPageExample.args = args

export { ActorPageExample }
