import {
  ActorPageContent,
  ActorPageContentProps,
} from "@components/ActorPageContent"
import { firstActor } from "@mock-data/actors"
import { funds } from "@mock-data/funds"
import { Meta, Story } from "@storybook/react/types-6-0"
import { Block } from "baseui/block"
import { HeadingLarge } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
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

const args: ActorPageContentProps = {
  frontmatter: firstActor,
  funds: funds.filter(f => f.by.__type === 'Actor' && f.by.actor.uuid === firstActor.uuid),
  body: null,
  tableOfContents: { items: undefined },
  timeToRead: O.none,
}

ActorPageExample.args = args

export { ActorPageExample }
