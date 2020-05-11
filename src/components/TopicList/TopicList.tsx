import * as React from "react"
import { TopicFrontmatter } from "../../types/topic"
import { Tag } from "../Common"

export interface TopicListTopic extends TopicFrontmatter {
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
          key={t.slug}
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
