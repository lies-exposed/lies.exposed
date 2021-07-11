import { List, ListItemProps } from "@components/Common/List";
import { Topic } from "@io/http";
import { Chip } from "@material-ui/core";
import * as React from "react";

export interface TopicListTopic extends Omit<Topic.TopicFrontmatter, "color"> {
  selected: boolean;
  color: string;
}

interface TopicListProps {
  topics: TopicListTopic[];
  onTopicClick: (t: TopicListTopic) => void;
}

export const TopicListItem: React.FC<ListItemProps<TopicListTopic>> = ({
  item: t,
  onClick,
}) => <Chip key={t.slug} label={t.label} onClick={() => onClick?.(t)} />;

const TopicList: React.FC<TopicListProps> = ({ topics, onTopicClick }) => {
  return (
    <List<TopicListTopic>
      data={topics}
      filter={(_) => true}
      onItemClick={onTopicClick}
      getKey={(t) => t.id}
      ListItem={(p) => <TopicListItem {...p} />}
    />
  );
};

export default TopicList;
