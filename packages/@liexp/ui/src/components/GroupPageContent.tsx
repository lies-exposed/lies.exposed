import { type GroupMember } from "@liexp/shared/lib/io/http/GroupMember.js";
import {
  type Actor,
  type Group,
  type Project,
} from "@liexp/shared/lib/io/http/index.js";
import { isValidValue } from "@liexp/shared/lib/slate/index.js";
import * as React from "react";
import { useTheme } from "../theme/index.js";
import { LazyEditor as Editor } from "./Common/Editor/index.js";
import { ActorList } from "./lists/ActorList.js";
import GroupList from "./lists/GroupList.js";
import { Grid, Typography } from "./mui/index.js";

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
