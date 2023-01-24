import { type Keyword } from "@liexp/shared/io/http";
import * as React from "react";
import { List, type ListItemProps } from "../Common/List";
import { Typography } from "../mui";

export interface KeywordListTopic extends Keyword.Keyword {
  selected: boolean;
}

interface KeywordListProps {
  style?: React.CSSProperties;
  keywords: KeywordListTopic[];
  onItemClick: (t: KeywordListTopic) => void;
}

export const KeywordListItem: React.FC<ListItemProps<KeywordListTopic>> = ({
  item: t,
  onClick,
}) => (
  <Typography
    key={t.id}
    variant="body2"
    style={{
      marginRight: 10,
      borderColor: `#${t.color}`,
      color: `#${t.color}`,
      fontWeight: 700,
      display: "inline-block",
      cursor: "pointer",
    }}
    onClick={() => onClick?.(t)}
  >
    #{t.tag}
  </Typography>
);

const KeywordList: React.FC<KeywordListProps> = ({
  keywords,
  onItemClick,
  style,
}) => {
  return (
    <List<KeywordListTopic>
      data={keywords}
      filter={(_) => true}
      onItemClick={onItemClick}
      getKey={(t) => t.id}
      style={{ display: "flex", ...style }}
      ListItem={(p) => <KeywordListItem {...p} onClick={onItemClick} />}
    />
  );
};

export default KeywordList;
