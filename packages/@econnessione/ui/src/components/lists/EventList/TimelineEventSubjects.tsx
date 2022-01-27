import { Events } from "@econnessione/shared/io/http";
import { Box } from "@material-ui/core";
import * as React from "react";
import { ActorList } from "../ActorList";
import GroupsList from "../GroupList";
import { GroupsMembersList } from "../GroupMemberList";
import { SearchEvent } from "./EventListItem";

export interface EventListItemProps {
  event: SearchEvent;
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
  ...props
}) => {
  const actors =
    e.type === "Death"
      ? [e.payload.victim]
      : Events.ScientificStudy.ScientificStudy.is(e)
      ? e.payload.authors
      : [];

  const groups = e.type === "Uncategorized" ? e.payload.groups : [];
  const groupsMembers =
    e.type === "Uncategorized" ? e.payload.groupsMembers : [];

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
