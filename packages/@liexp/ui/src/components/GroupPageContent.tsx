import { Actor, Events, Group, Project } from "@liexp/shared/io/http";
import { GroupMember } from "@liexp/shared/io/http/GroupMember";
import { Grid, Typography, useTheme } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import Editor, { isValidValue } from "./Common/Editor/index";
import { ActorList } from "./lists/ActorList";
import GroupList from "./lists/GroupList";

export interface GroupPageContentProps extends Group.Group {
  groupsMembers: GroupMember[];
  events: Events.Event[];
  projects: Project.Project[];
  funds: any[];
  ownedGroups: Group.Group[];
  onMemberClick: (m: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
}

export const GroupPageContent: React.FC<GroupPageContentProps> = ({
  onMemberClick,
  projects,
  funds,
  events,
  body,
  groupsMembers,
  ownedGroups,
  onGroupClick,
  ...group
}) => {
  const theme = useTheme();

  return (
    <Grid container direction="column">
      <Grid
        container
        direction="row"
        alignItems="center"
        spacing={2}
        style={{ marginBottom: theme.spacing(2) }}
      >
        <Grid item>
          {pipe(
            O.fromNullable(group.avatar),
            O.fold(
              () => <div />,
              (src) => (
                <img src={src} style={{ width: "100px", marginRight: 20 }} />
              )
            )
          )}
        </Grid>
        <Grid item>
          <Typography variant="h2" style={{ marginBottom: 0 }}>
            {group.name}
          </Typography>
          <Editor value={group.excerpt as any} readOnly={true} />
        </Grid>
      </Grid>
      <Grid container style={{ marginBottom: 20 }}>
        {ownedGroups.length > 0 ? (
          <Grid item md={6}>
            <Typography variant="h6">Owned groups</Typography>
            <GroupList
              groups={ownedGroups.map((gg) => ({ ...gg, selected: true }))}
              onItemClick={onGroupClick}
            />
          </Grid>
        ) : null}

        <Grid item md={6}>
          <Typography variant="h6">Members</Typography>
          <ActorList
            actors={groupsMembers.map((g) => ({
              ...g.actor,
              selected: false,
            }))}
            onActorClick={onMemberClick}
            avatarSize="small"
          />
        </Grid>
        {isValidValue(body) ? (
          <Grid item sm={12}>
            <Editor value={body} readOnly />
          </Grid>
        ) : null}
      </Grid>
    </Grid>
  );
};
