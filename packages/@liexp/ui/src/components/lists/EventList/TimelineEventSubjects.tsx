import { getEventsMetadata } from "@liexp/shared/helpers/event";
import { Actor, Group, GroupMember } from "@liexp/shared/io/http";
import { SearchEvent } from "@liexp/shared/io/http/Events";
import { Box, BoxProps, makeStyles } from "@material-ui/core";
import * as React from "react";
import { ActorList } from "../ActorList";
import GroupsList from "../GroupList";
import { GroupsMembersList } from "../GroupMemberList";

export interface EventListItemProps extends BoxProps {
  event: SearchEvent.SearchEvent;
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
  subjectInnerBox: {
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      justifyContent: "flex-end",
    },
  },
  subjectsList: {
    display: "flex",
    flexDirection: "column",
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

  const { actors, groups, groupsMembers } = getEventsMetadata(e);

  const content = React.useMemo(() => {
    if (
      actors.length === 0 &&
      groups.length === 0 &&
      groupsMembers.length === 0
    ) {
      return null;
    }

    return (
      <Box {...props} className={classes.subjectInnerBox}>
        <ActorList
          className={classes.subjectsList}
          style={style}
          actors={actors.map((a) => ({ ...a, selected: true }))}
          onActorClick={onActorClick}
        />
        <GroupsList
          className={classes.subjectsList}
          groups={groups.map((a) => ({ ...a, selected: true }))}
          onItemClick={onGroupClick}
        />
        <GroupsMembersList
          className={classes.subjectsList}
          groupsMembers={groupsMembers.map((gm) => ({
            ...gm,
            selected: true,
          }))}
          onItemClick={onGroupMemberClick}
        />
      </Box>
    );
  }, [e.id]);

  return (
    <Box className={classes.subjectsBox} {...props}>
      {content}
    </Box>
  );
};
