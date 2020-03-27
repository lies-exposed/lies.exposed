import { TopicData } from "@models/topic"
import { themedUseStyletron } from "@theme/CustomeTheme"
import { Tag, VARIANT, KIND } from "baseui/tag"
import * as React from "react"

export interface TopicListTopic extends TopicData {
  selected: boolean
  color: string
}

interface TopicListProps {
  topics: TopicListTopic[]
  onTopicClick: (t: TopicListTopic) => void
}

const TopicList: React.FC<TopicListProps> = ({ topics, onTopicClick }) => {
  const [, $theme] = themedUseStyletron()
  return (
    <div className="tags">
      {topics.map(t => {
        return (
          <Tag
            key={t.id}
            kind={KIND.custom}
            variant={t.selected ? VARIANT.solid : VARIANT.outlined}
            color={t.color}
            title={t.label}
            onClick={() => onTopicClick(t)}
            closeable={false}
            overrides={{
              Text: {
                style: () => ({
                  fontFamily: $theme.typography.secondaryFont,
                }),
              },
            }}
          >
            {t.label}
          </Tag>
        )
      })}
    </div>
  )
}

export default TopicList
