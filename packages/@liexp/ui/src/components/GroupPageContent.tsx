import { type GroupMember } from "@liexp/shared/lib/io/http/GroupMember.js";
import {
  type Actor,
  type Group,
  type Project,
} from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useTheme } from "../theme/index.js";
import { BNEditor } from "./Common/BlockNote/index.js";
import { ActorList } from "./lists/ActorList.js";
import GroupList from "./lists/GroupList.js";
import { Grid, Typography } from "./mui/index.js";

export interface GroupPageContentProps {
  group: Group.Group;
  groupsMembers: readonly GroupMember[];
  projects: readonly Project.Project[];
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
        <Grid size={{ sm: 12, md: 6, lg: 6 }}>
          <BNEditor
            content={group.excerpt ? [...group.excerpt] : null}
            readOnly={true}
          />
        </Grid>
        <Grid size={{ lg: 6 }}>
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
              <Grid size={{ md: 6 }}>
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

        <Grid size={{ sm: 12 }}>
          <BNEditor content={group.body} readOnly />
        </Grid>
      </Grid>
    </Grid>
  );
};
