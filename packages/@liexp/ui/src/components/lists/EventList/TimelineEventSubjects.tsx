import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations";
import {
  type Actor,
  type Group,
  type GroupMember,
} from "@liexp/shared/lib/io/http";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events";
import * as React from "react";
import { styled } from "../../../theme";
import { Box, type BoxProps } from "../../mui";
import { ActorList } from "../ActorList";
import GroupsList from "../GroupList";
import { GroupsMembersList } from "../GroupMemberList";

const PREFIX = "TimelineEventSubjects";

const classes = {
  subjectsBox: `${PREFIX}-subjectsBox`,
  subjectInnerBox: `${PREFIX}-subjectInnerBox`,
  subjectsList: `${PREFIX}-subjectsList`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.subjectsBox}`]: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    [theme.breakpoints.down("md")]: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
  },

  [`&.${classes.subjectInnerBox}`]: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("md")]: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
  },

  [`& .${classes.subjectsList}`]: {
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.down("md")]: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
  },
}));

export interface EventListItemProps extends BoxProps {
  event: SearchEvent.SearchEvent;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onGroupMemberClick: (gm: GroupMember.GroupMember) => void;
}

export const TimelineEventSubjects: React.FC<EventListItemProps> = ({
  event: e,
  style,
  onClick,
  onActorClick,
  onGroupClick,
  onGroupMemberClick,
  ...props
}) => {
  const { actors, groups, groupsMembers } = getSearchEventRelations(e);

  const content = React.useMemo(() => {
    if (
      actors.length === 0 &&
      groups.length === 0 &&
      groupsMembers.length === 0
    ) {
      return null;
    }

    return (
      <StyledBox {...props} className={classes.subjectInnerBox}>
        <ActorList
          className={classes.subjectsList}
          style={style}
          actors={actors.map((a) => ({ ...a, selected: true }))}
          onActorClick={onActorClick}
          avatarSize="xsmall"
        />
        <GroupsList
          className={classes.subjectsList}
          groups={groups.map((a) => ({ ...a, selected: true }))}
          onItemClick={onGroupClick}
          avatarSize="xsmall"
        />
        <GroupsMembersList
          className={classes.subjectsList}
          groupsMembers={groupsMembers.map((gm) => ({
            ...gm,
            selected: true,
          }))}
          onItemClick={onGroupMemberClick}
          avatarSize="xsmall"
        />
      </StyledBox>
    );
  }, [e.id]);

  return (
    <Box className={classes.subjectsBox} {...props}>
      {content}
    </Box>
  );
};
