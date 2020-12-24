import {
  ActorPageContent,
  ActorPageContentProps,
} from "@components/ActorPageContent"
import { actorPageContentArgs } from "@components/examples/ActorPageContentExample"
import { Meta, Story } from "@storybook/react/types-6-0"
import { Block } from "baseui/block"
import { HeadingLarge } from "baseui/typography"
import * as React from "react"

const meta: Meta = {
  title: "Components/Pages/ActorPageContent",
  component: ActorPageContent,
}

export default meta

const Template: Story<ActorPageContentProps> = (props) => {
  return (
    <Block overrides={{ Block: { style: { width: '100%'}}}}>
      <HeadingLarge>TODO</HeadingLarge>
      <ul>
        <li>mostarre impatto progetti finanziati</li>
      </ul>
      <ActorPageContent {...props} />
    </Block>
  )
}

const ActorPageExample = Template.bind({})

ActorPageExample.args = actorPageContentArgs

export { ActorPageExample }
