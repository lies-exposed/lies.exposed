import {
  Actor,
  Group,
  GroupMember,
  Events,
} from "@econnessione/shared/io/http";
import { Box } from "@material-ui/core";
import * as React from "react";
import { ActorList } from "../ActorList";
import GroupsList from "../GroupList";
import { GroupsMembersList } from "../GroupMemberList";
import { SearchEvent } from "./EventListItem";

export interface EventListItemProps {
  event: SearchEvent;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onGroupMemberClick: (gm: GroupMember.GroupMember) => void;
}

const style: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
};

export const TimelineEventSubjects: React.FC<EventListItemProps> = ({
  event: e,
  onActorClick,
  onGroupClick,
  onGroupMemberClick,
}) => {
  const actors =
    e.type === Events.Death.DEATH.value
      ? [e.payload.victim]
      : e.type === Events.ScientificStudy.ScientificStudyType.value
      ? e.payload.authors
      : e.type === Events.Uncategorized.UncategorizedType.value
      ? e.payload.actors
      : [];

  const groups =
    e.type === Events.Uncategorized.UncategorizedType.value
      ? e.payload.groups
      : e.type === Events.ScientificStudy.ScientificStudyType.value
      ? [e.payload.publisher]
      : [];
  const groupsMembers =
    e.type === Events.Uncategorized.UncategorizedType.value
      ? e.payload.groupsMembers
      : [];

  const content = React.useMemo(() => {
    switch (e.type) {
      case Events.Death.DEATH.value:
        return (
          <ActorList
            style={style}
            avatarSize="medium"
            actors={actors.map((a) => ({ ...a, selected: true }))}
            onActorClick={onActorClick}
          />
        );
      case Events.ScientificStudy.ScientificStudyType.value:
        return (
          <Box style={{ ...style, flexDirection: "column" }}>
            <GroupsList
              style={style}
              avatarSize="medium"
              groups={groups.map((a) => ({ ...a, selected: true }))}
              onItemClick={onGroupClick}
            />
          </Box>
        );
      default: {
        return (
          <>
            <ActorList
              style={style}
              actors={actors.map((a) => ({ ...a, selected: true }))}
              onActorClick={onActorClick}
            />
            <GroupsList
              style={style}
              groups={groups.map((a) => ({ ...a, selected: true }))}
              onItemClick={onGroupClick}
            />
            <GroupsMembersList
              style={style}
              groupsMembers={groupsMembers.map((gm) => ({
                ...gm,
                selected: true,
              }))}
              onItemClick={onGroupMemberClick}
            />
          </>
        );
      }
    }
  }, [e.type]);

  return <Box style={{ ...style, flexDirection: "column" }}>{content}</Box>;
};
