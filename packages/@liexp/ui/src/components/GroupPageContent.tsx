import {
  type Actor,
  type Group,
  type Project,
} from "@liexp/shared/lib/io/http";
import { type GroupMember } from "@liexp/shared/lib/io/http/GroupMember";
import { isValidValue } from "@liexp/shared/lib/slate";
import * as React from "react";
import { useTheme } from "../theme";
import { LazyEditor as Editor } from "./Common/Editor/index";
import { ActorList } from "./lists/ActorList";
import GroupList from "./lists/GroupList";
import { Grid, Typography } from "./mui";

export interface GroupPageContentProps {
  group: Group.Group;
  groupsMembers: GroupMember[];
  projects: Project.Project[];
  funds: any[];
  ownedGroups: Group.Group[];
  onMemberClick: (m: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
}

export const GroupPageContent: React.FC<GroupPageContentProps> = ({
  group,
  onMemberClick,
  groupsMembers,
  ownedGroups,
  onGroupClick,
}) => {
  const theme = useTheme();

  return (
    <Grid className="group-page-content" container direction="column">
      <Grid
        container
        direction="row"
        alignItems="center"
        spacing={2}
        style={{
          display: "flex",
          alignItems: "flex-start",
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
        }}
      >
        <Grid item lg={6} md={6} sm={12}>
          <Editor value={group.excerpt as any} readOnly={true} />
        </Grid>
        <Grid item lg={6}>
          <Typography variant="h6">Members</Typography>
          <ActorList
            style={{ display: "flex", flexDirection: "row" }}
            actors={groupsMembers.map((g) => ({
              ...g.actor,
              selected: true,
            }))}
            onActorClick={onMemberClick}
            avatarSize="small"
          />
          <Grid container style={{ marginBottom: 20 }}>
            {ownedGroups.length > 0 ? (
              <Grid item md={6}>
                <Typography variant="h6">Owned groups</Typography>
                <GroupList
                  style={{ display: "flex", flexDirection: "column" }}
                  groups={ownedGroups.map((gg) => ({ ...gg, selected: true }))}
                  onItemClick={onGroupClick}
                />
              </Grid>
            ) : null}
          </Grid>
        </Grid>
        {isValidValue(group.body) ? (
          <Grid item sm={12}>
            <Editor value={group.body} readOnly />
          </Grid>
        ) : null}
      </Grid>
    </Grid>
  );
};
