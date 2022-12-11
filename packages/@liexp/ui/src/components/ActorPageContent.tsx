import { Actor, Group } from "@liexp/shared/io/http";
import { SearchEvent } from "@liexp/shared/io/http/Events/SearchEvent";
import * as React from "react";
import ActorsBox from "../containers/ActorsBox";
import { DeathBox } from "../containers/DeathBox";
import Editor from "./Common/Editor";
import GroupList from "./lists/GroupList";
import { Box, Grid } from "./mui";

export interface ActorPageContentProps {
  actor: Actor.Actor;
  groups: Group.Group[];
  onGroupClick: (a: Group.Group) => void;
  onActorClick: (a: Actor.Actor) => void;
  onEventClick: (e: SearchEvent) => void;
}

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  actor,
  groups,
  onGroupClick,
  onActorClick,
  onEventClick,
}) => {


  return (
    <Grid className="actor-page-content" container spacing={2}>
      <Grid container direction="row" alignItems="flex-start">
        <Grid
          item
          md={3}
          sm={4}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Box style={{ display: "flex" }}>
            <GroupList
              groups={groups.map((g) => ({ ...g, selected: false }))}
              onItemClick={onGroupClick}
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            />
          </Box>
        </Grid>
        <Grid item md={9} sm={8}>
          {actor.death ? <DeathBox id={actor.death} /> : null}
          {actor.excerpt ? (
            <Editor value={actor.excerpt as any} readOnly />
          ) : null}
          {actor.body ? <Editor value={actor.body as any} readOnly /> : null}
        </Grid>
      </Grid>
      <Grid container>
        {groups.length > 0 && (
          <Grid item md={6} sm={6} xs={12}>
            <ActorsBox
              style={{ display: "flex", flexDirection: "row" }}
              params={{
                sort: { field: "updatedAt", order: "DESC" },
                pagination: {
                  page: 1,
                  perPage: 3,
                },
                filter: {
                  group: groups.map((g) => g.id),
                },
              }}
              onItemClick={onActorClick}
            />
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
