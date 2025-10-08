import {
  ByActor,
  type ByGroup,
} from "@liexp/shared/lib/io/http/Common/BySubject.js";
import { Schema } from "effect";
import * as React from "react";
import { type AvatarSize } from "../Common/Avatar.js";
import { ExpandableList } from "../Common/ExpandableList.js";
import { List, type ListItemProps } from "../Common/List.js";
import { ActorListItem } from "./ActorList.js";
import { GroupListItem } from "./GroupList.js";

type SubjectItem = (ByActor | ByGroup) & { selected: boolean };

export interface SubjectListItemProps extends ListItemProps<SubjectItem> {
  avatarSize?: AvatarSize;
  displayFullName?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
}

export interface SubjectListProps {
  className?: string;
  subjects: SubjectItem[];
  onSubjectClick: (actor: SubjectItem, e: any) => void;
  avatarSize?: AvatarSize;
  displayFullName?: boolean;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}

export const SubjectList: React.FC<SubjectListProps> = ({
  subjects,
  onSubjectClick,
  avatarSize,
  itemStyle,
  displayFullName,
  ...props
}) => {
  return (
    <List
      {...props}
      style={{
        ...props.style,
        flexWrap: "wrap",
      }}
      data={subjects}
      getKey={(a) => a.id.id}
      filter={(_a) => true}
      onItemClick={onSubjectClick}
      ListItem={(p) =>
        Schema.is(ByActor)(p.item) ? (
          <ActorListItem
            avatarSize={avatarSize}
            displayFullName={displayFullName}
            style={itemStyle}
            item={{ ...p.item.id, selected: p.item.selected }}
          />
        ) : (
          <GroupListItem
            avatarSize={avatarSize}
            displayName={displayFullName}
            style={itemStyle}
            item={{ ...p.item.id, selected: p.item.selected }}
          />
        )
      }
    />
  );
};

export const ExpandableSubjectList: React.FC<
  SubjectListProps & { limit?: number }
> = ({
  subjects,
  onSubjectClick,
  avatarSize,
  itemStyle,
  displayFullName,
  limit = 10,
  style,
  ...props
}) => {
  return (
    <ExpandableList
      {...props}
      limit={limit}
      style={{
        ...style,
        flexWrap: "wrap",
      }}
      data={subjects}
      getKey={(a) => a.id.id}
      filter={(a) => a.selected}
      onItemClick={onSubjectClick}
      ListItem={(p) =>
        Schema.is(ByActor)(p.item) ? (
          <ActorListItem
            avatarSize={avatarSize}
            displayFullName={displayFullName}
            style={itemStyle}
            item={{ ...p.item.id, selected: p.item.selected }}
          />
        ) : (
          <GroupListItem
            avatarSize={avatarSize}
            displayName={displayFullName}
            style={itemStyle}
            item={{ ...p.item.id, selected: p.item.selected }}
          />
        )
      }
    />
  );
};
