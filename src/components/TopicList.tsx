import { TopicFrontmatter } from "@models/topic"
import { Tag, VARIANT, KIND } from "baseui/tag"
import * as React from "react"

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
      {topics.map(t => {
        return (
          <Tag
            key={t.slug}
            kind={KIND.custom}
            variant={t.selected ? VARIANT.solid : VARIANT.outlined}
            color={t.color}
            onClick={() => onTopicClick(t)}
            closeable={false}
          >
            {t.label}
          </Tag>
        )
      })}
    </div>
  )
}

export default TopicList