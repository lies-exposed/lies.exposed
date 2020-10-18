import {
  TopicPageContent,
  TopicPageContentProps
} from "@components/TopicPageContent"
import { firstTopic } from "@mock-data/topics"
import { Meta, Story } from "@storybook/react/types-6-0"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const meta: Meta = {
  title: "Components/Pages/TopicPageContent",
  component: TopicPageContent,
}

export default meta

const Template: Story<TopicPageContentProps> = (props) => {
  return <TopicPageContent {...props} />
}

const TopicPageContentExample = Template.bind({})

const args: TopicPageContentProps = {
  frontmatter: firstTopic,
  body: null,
  tableOfContents: { items: undefined },
  timeToRead: O.none,
}

TopicPageContentExample.args = args

export { TopicPageContentExample }
