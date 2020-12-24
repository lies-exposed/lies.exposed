import {
  AreaPageContent,
  AreaPageContentProps,
} from "@components/AreaPageContent"
import { firstArea } from "@mock-data/areas"
import { Meta, Story } from "@storybook/react/types-6-0"
import { Block } from "baseui/block"
import { HeadingLarge } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Components/Pages/AreaPageContent",
  component: AreaPageContent,
}

export default meta

const Template: Story<AreaPageContentProps> = (props) => {
  return (
    <Block overrides={{ Block: { style: { width: '100%'}}}}>
      <HeadingLarge>TODO:</HeadingLarge>
      <ul>
        <li>Lista dei progetti in questa area</li>
      </ul>
      <AreaPageContent {...props} />
    </Block>
  )
}

const AreaPageContentExample = Template.bind({})

const args: AreaPageContentProps = {
  frontmatter: firstArea,
  body: null,
  tableOfContents: O.none,
  timeToRead: O.none,
  onGroupClick: () => {},
  onTopicClick: () => {},
}

AreaPageContentExample.args = args

export { AreaPageContentExample }
