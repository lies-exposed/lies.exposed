import { Actor, Group, GroupMember, Events } from "@liexp/shared/io/http";
import { Box, BoxProps, makeStyles } from "@material-ui/core";
import * as React from "react";
import { ActorList } from "../ActorList";
import GroupsList from "../GroupList";
import { GroupsMembersList } from "../GroupMemberList";
import { SearchEvent } from "./EventListItem";

export interface EventListItemProps extends BoxProps {
  event: SearchEvent;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onGroupMemberClick: (gm: GroupMember.GroupMember) => void;
}

const useStyles = makeStyles((theme) => ({
  subjectsBox: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
  },
}));

export const TimelineEventSubjects: React.FC<EventListItemProps> = ({
  event: e,
  style,
  onActorClick,
  onGroupClick,
  onGroupMemberClick,
  ...props
}) => {
  const classes = useStyles();
  const actors =
    e.type === Events.Death.DEATH.value
      ? [e.payload.victim]
      : e.type === Events.ScientificStudy.ScientificStudyType.value
      ? e.payload.authors
      : e.type === Events.Uncategorized.UncategorizedType.value
      ? e.payload.actors
      : e.type === Events.Patent.PATENT.value
      ? e.payload.owners.actors
      : [];

  const groups =
    e.type === Events.Uncategorized.UncategorizedType.value
      ? e.payload.groups
      : e.type === Events.ScientificStudy.ScientificStudyType.value
      ? [e.payload.publisher]
      : e.type === Events.Patent.PATENT.value
      ? e.payload.owners.groups
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
          <GroupsList
            style={style}
            avatarSize="medium"
            groups={groups.map((a) => ({ ...a, selected: true }))}
            onItemClick={onGroupClick}
          />
        );
      default: {
        return (
          <Box {...props} style={style}>
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
          </Box>
        );
      }
    }
  }, [e.type]);

  return (
    <Box className={classes.subjectsBox} {...props}>
      {content}
    </Box>
  );
};
