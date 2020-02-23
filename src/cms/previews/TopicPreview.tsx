import TopicList from "@components/TopicList"
import * as React from "react"

export const TopicPreview: React.FC<any> = props => {
  const { entry } = props
  const topic = {
    ...entry.getIn(["data"]).toObject(),
    selected: true
  }

  return <TopicList topics={[topic]} onTopicClick={() => undefined} />
}
