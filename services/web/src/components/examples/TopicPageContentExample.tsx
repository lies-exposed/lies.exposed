import {
  TopicPageContent,
  TopicPageContentProps
} from "@components/TopicPageContent"
import { firstTopic } from "@mock-data/topics"
import { Card } from "baseui/card"
import * as O from "fp-ts/lib/Option"
import * as R from "fp-ts/lib/Record"
import * as React from "react"

export const topicPageContentArgs: TopicPageContentProps = {
  id: "",
  frontmatter: firstTopic,
  body: "",
  tableOfContents: O.none,
  timeToRead: O.none,
}

export const TopicPageContentExample: React.FC<TopicPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as any)
    ? topicPageContentArgs
    : props

  return (
    <Card overrides={{ Root: { style: { width: "100%" } } }}>
      <TopicPageContent {...pageContentProps} />
    </Card>
  )
}
