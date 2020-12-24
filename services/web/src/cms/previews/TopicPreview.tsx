import TopicList from "@components/lists/TopicList"
import * as React from "react"

export const TopicPreview: React.FC<any> = props => {
  const { entry } = props
  const data = entry.getIn(["data"]).toObject()
  const topic = {
    ...data,
    selected: true
  }

  return <TopicList topics={[topic]} onTopicClick={() => undefined} />
}
