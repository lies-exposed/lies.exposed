import { type Keyword } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { ExpandableList } from "../Common/ExpandableList";
import { List, type ListItemProps } from "../Common/List";
import { Typography } from "../mui";

export interface KeywordItem extends Keyword.Keyword {
  selected: boolean;
}

interface KeywordListProps {
  style?: React.CSSProperties;
  keywords: KeywordItem[];
  onItemClick: (t: KeywordItem) => void;
}

export const KeywordListItem: React.FC<ListItemProps<KeywordItem>> = ({
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
      opacity: t.selected ? 1 : 0.2,
    }}
    onClick={(e) => {
      if (onClick) {
        e.preventDefault();
        e.stopPropagation();
        onClick(t);
      }
    }}
  >
    #{t.tag}
  </Typography>
);

const KeywordList: React.FC<KeywordListProps> = ({
  keywords,
  onItemClick,
  style,
  ...props
}) => {
  return (
    <List
      {...props}
      data={keywords}
      filter={(_) => true}
      onItemClick={onItemClick}
      getKey={(t) => t.id}
      style={{ display: "flex", flexWrap: "wrap", ...style }}
      ListItem={(p) => <KeywordListItem {...p} onClick={onItemClick} />}
    />
  );
};

export default KeywordList;

export const ExpandableKeywordList: React.FC<
  KeywordListProps & { limit?: number }
> = ({ keywords, onItemClick, style, limit = 10, ...props }) => {
  return (
    <ExpandableList
      {...props}
      limit={limit}
      data={keywords}
      filter={(k) => k.selected}
      onItemClick={onItemClick}
      getKey={(t) => t.id}
      style={{ display: "flex", flexWrap: "wrap", ...style }}
      ListItem={(p) => <KeywordListItem {...p} onClick={onItemClick} />}
    />
  );
};
