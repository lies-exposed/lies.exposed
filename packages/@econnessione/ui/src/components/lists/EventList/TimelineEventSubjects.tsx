import {
  Actor,
  Events,
  Group,
  GroupMember,
} from "@econnessione/shared/io/http";
import { Box } from "@material-ui/core";
import * as React from "react";
import { ActorList } from "../ActorList";
import GroupsList from "../GroupList";
import { GroupsMembersList } from "../GroupMemberList";

export interface EventListItemProps {
  event: Events.Event;
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  // onActorClick: (a: Actor.Actor) => void;
  // onGroupClick: (g: Group.Group) => void;
  // onGroupMemberClick: (gm: GroupMember.GroupMember) => void;
}

const style: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
};

export const TimelineEventSubjects: React.FC<EventListItemProps> = ({
  event: e,
  actors,
  groups,
  groupsMembers,
  ...props
}) => {
  return (
    <Box style={{ ...style, flexDirection: "column" }}>
      <ActorList
        style={style}
        actors={actors.map((a) => ({ ...a, selected: true }))}
        onActorClick={() => {}}
      />
      <GroupsList
        style={style}
        groups={groups.map((a) => ({ ...a, selected: true }))}
        onGroupClick={() => {}}
      />
      <GroupsMembersList
        style={style}
        groupsMembers={groupsMembers.map((gm) => ({ ...gm, selected: true }))}
        onItemClick={() => {}}
      />
    </Box>
  );
};
