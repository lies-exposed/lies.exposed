import { Actor, Group } from "@liexp/shared/io/http";
import { Box, Grid, Typography } from "@mui/material";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import ActorsBox from "../containers/ActorsBox";
import { DeathBox } from "../containers/DeathBox";
import { Avatar } from "./Common/Avatar";
import EditButton from "./Common/Button/EditButton";
import Editor from "./Common/Editor";
import GroupList from "./lists/GroupList";

export interface ActorPageContentProps {
  actor: Actor.Actor;
  groups: Group.Group[];
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
    <Grid container>
      <Grid container direction="row" alignItems="center">
        <Grid
          item
          md={3}
          sm={4}
          style={{
            display: 'flex',
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          {pipe(
            O.fromNullable(actor.avatar),
            O.fold(
              () => <div />,
              (src) => <Avatar size="xlarge" src={src} />
            )
          )}
        </Grid>
        <Grid item md={9} sm={8}>
          <Typography variant="h2">{actor.fullName}</Typography>
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="actors" resource={actor} />
          </div>
          {actor.death ? <DeathBox id={actor.death} /> : null}
          {actor.excerpt ? (
            <Editor value={actor.excerpt as any} readOnly />
          ) : null}
          {actor.body ? <Editor value={actor.body as any} readOnly /> : null}
        </Grid>
      </Grid>
      <Grid container>
        <Grid item md={6} sm={6} xs={12}>
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
      </Grid>
    </Grid>
  );
};
