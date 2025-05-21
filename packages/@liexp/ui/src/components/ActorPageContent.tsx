import { type Actor, type Group } from "@liexp/shared/lib/io/http/index.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import * as React from "react";
import ActorsBox from "../containers/ActorsBox.js";
import { DeathBox } from "../containers/DeathBox.js";
import { BNEditor } from "./Common/BlockNote/index.js";
import GroupList from "./lists/GroupList.js";
import { Box, Grid, Typography } from "./mui/index.js";

export interface ActorPageContentProps {
  actor: Actor.Actor;
  groups: readonly Group.Group[];
  onGroupClick: (a: Group.Group) => void;
  onActorClick: (a: Actor.Actor) => void;
}

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  actor,
  groups,
  onGroupClick,
  onActorClick,
}) => {
  return (
    <Grid className="actor-page-content" container spacing={2}>
      <Grid size={{ md: 9, sm: 8 }}>
        {actor.death ? <DeathBox id={actor.death} /> : null}
        {isValidValue(actor.excerpt) ? (
          <BNEditor content={actor.excerpt} readOnly />
        ) : null}
        {isValidValue(actor.body) ? (
          <BNEditor content={actor.body} readOnly />
        ) : null}
      </Grid>
      {groups.length > 0 ? (
        <Grid
          size={{ md: 6, sm: 6 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Box>
            <Typography variant="h6">Member Of</Typography>
            <GroupList
              groups={groups.map((g) => ({ ...g, selected: true }))}
              onItemClick={onGroupClick}
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            />
          </Box>
        </Grid>
      ) : null}

      {groups.length > 0 && (
        <Grid size={{ md: 6, sm: 6, xs: 12 }}>
          <ActorsBox
            style={{ display: "flex", flexDirection: "row" }}
            params={{
              memberIn: groups.map((g) => g.id),
              _sort: "updatedAt",
              _order: "DESC",
              _end: "3",
            }}
            onActorClick={onActorClick}
          />
        </Grid>
      )}
    </Grid>
  );
};
