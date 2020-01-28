import * as React from "react"
import { TopicPoint } from "../../types/topic"
import { Tag } from "../Common"

export interface TopicListTopic extends TopicPoint {
  selected: boolean
  color: string
}

interface TopicListProps {
  topics: TopicListTopic[]
  onTopicClick: (t: TopicListTopic) => void
}

const TopicList: React.FC<TopicListProps> = ({ topics, onTopicClick }) => {
  return (
    <div className="tags">
      {topics.map(t => (
        <Tag
          key={t.id}
          style={{
            cursor: "pointer",
            color: t.selected ? "white" : "black",
            backgroundColor: t.selected ? t.color : undefined,
          }}
          onClick={() => onTopicClick(t)}
        >
          {t.label}
        </Tag>
      ))}
    </div>
  )
}

export default TopicList
