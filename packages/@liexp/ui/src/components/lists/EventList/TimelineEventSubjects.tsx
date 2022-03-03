import { Actor, Events, Group, GroupMember } from "@liexp/shared/io/http";
import { Box, BoxProps, makeStyles } from "@material-ui/core";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
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
      : e.type === Events.ScientificStudy.SCIENTIFIC_STUDY.value
      ? e.payload.authors
      : e.type === Events.Uncategorized.UNCATEGORIZED.value
      ? e.payload.actors
      : e.type === Events.Patent.PATENT.value
      ? e.payload.owners.actors
      : e.type === Events.Documentary.DOCUMENTARY.value
      ? pipe(
          [...e.payload.authors.actors, ...e.payload.subjects.actors],
          A.uniq({ equals: (a1, a2) => a1.id === a2.id })
        )
      : [];

  const groups =
    e.type === Events.Uncategorized.UNCATEGORIZED.value
      ? e.payload.groups
      : e.type === Events.ScientificStudy.SCIENTIFIC_STUDY.value
      ? [e.payload.publisher]
      : e.type === Events.Patent.PATENT.value
      ? e.payload.owners.groups
      : e.type === Events.Documentary.DOCUMENTARY.value
      ? [...e.payload.authors.groups, ...e.payload.subjects.groups]
      : [];
  const groupsMembers =
    e.type === Events.Uncategorized.UNCATEGORIZED.value
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
      case Events.ScientificStudy.SCIENTIFIC_STUDY.value:
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
