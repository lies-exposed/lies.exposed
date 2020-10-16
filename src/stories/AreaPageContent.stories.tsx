import {
  AreaPageContent,
  AreaPageContentProps,
} from "@components/AreaPageContent"
import { firstArea } from "@mock-data/areas"
import { Meta, Story } from "@storybook/react/types-6-0"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Components/Pages/AreaPageContent",
  component: AreaPageContent,
}

export default meta

const Template: Story<AreaPageContentProps> = (props) => {
  return <AreaPageContent {...props} />
}

const AreaPageContentExample = Template.bind({})

const args: AreaPageContentProps = {
  frontmatter: firstArea,
  body: null,
  tableOfContents: { items: undefined },
  timeToRead: O.none,
  onGroupClick: () => {},
  onTopicClick: () => {}
}

AreaPageContentExample.args = args

export { AreaPageContentExample as EventPageContentExample }
