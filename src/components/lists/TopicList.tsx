import { List, ListItemProps } from "@components/Common/List"
import { TopicFrontmatter } from "@models/topic"
import { themedUseStyletron, CustomTheme } from "@theme/CustomeTheme"
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

const TopicListItem: (opts: {
  $theme: CustomTheme
}) => React.FC<ListItemProps<TopicListTopic>> = ({ $theme }) => ({
  item: t,
  onClick,
}) => (
  <Tag
    key={t.slug}
    kind={KIND.custom}
    variant={t.selected ? VARIANT.solid : VARIANT.outlined}
    color={t.color}
    title={t.label}
    onClick={() => onClick(t)}
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

const TopicList: React.FC<TopicListProps> = ({ topics, onTopicClick }) => {
  const [, $theme] = themedUseStyletron()

  return (
    <List<TopicListTopic>
      data={topics}
      filter={(_) => true}
      onItemClick={onTopicClick}
      getKey={(t) => t.uuid}
      ListItem={TopicListItem({ $theme })}
    />
  )
}

export default TopicList
