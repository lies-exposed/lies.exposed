import { List, ListItemProps } from "@components/Common/List";
import { Topic } from "@econnessione/shared/lib/io/http";
import theme, { CustomTheme } from "@theme/CustomeTheme";
import { KIND, Tag, VARIANT } from "baseui/tag";
import * as React from "react";

export interface TopicListTopic extends Topic.TopicFrontmatter {
  selected: boolean;
  color: string;
}

interface TopicListProps {
  topics: TopicListTopic[];
  onTopicClick: (t: TopicListTopic) => void;
}

export const TopicListItem: React.FC<
  ListItemProps<TopicListTopic> & { $theme: CustomTheme }
> = ({ item: t, $theme, onClick }) => (
  <Tag
    key={t.slug}
    kind={KIND.custom}
    variant={t.selected ? VARIANT.solid : VARIANT.outlined}
    color={`#${t.color}`}
    title={t.label}
    onClick={() => onClick?.(t)}
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
);

const TopicList: React.FC<TopicListProps> = ({ topics, onTopicClick }) => {
  return (
    <List<TopicListTopic>
      data={topics}
      filter={(_) => true}
      onItemClick={onTopicClick}
      getKey={(t) => t.id}
      ListItem={(p) => <TopicListItem $theme={theme} {...p} />}
    />
  );
};

export default TopicList;
