import { Keyword } from "@econnessione/shared/io/http";
import { Chip } from "@material-ui/core";
import * as React from "react";
import { List, ListItemProps } from "../Common/List";

export interface KeywordListTopic extends Keyword.Keyword {
  selected: boolean;
}

interface KeywordListProps {
  keywords: KeywordListTopic[];
  onItemClick: (t: KeywordListTopic) => void;
}

export const KeywordListItem: React.FC<ListItemProps<KeywordListTopic>> = ({
  item: t,
  onClick,
}) => (
  <Chip
    key={t.id}
    size="small"
    label={t.tag}
    color="primary"
    variant="outlined"
    style={{ marginRight: 10 }}
    onClick={() => onClick?.(t)}
  />
);

const KeywordList: React.FC<KeywordListProps> = ({ keywords, onItemClick }) => {
  return (
    <List<KeywordListTopic>
      data={keywords}
      filter={(_) => true}
      onItemClick={onItemClick}
      getKey={(t) => t.id}
      style={{ display: "inline" }}
      ListItem={(p) => (
        <KeywordListItem {...p} onClick={() => onItemClick(p.item)} />
      )}
    />
  );
};

export default KeywordList;
