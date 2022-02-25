import { Actor, Group } from "@liexp/shared/io/http";
import { Box, Grid, Typography } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Avatar } from "./Common/Avatar";
import EditButton from "./Common/Button/EditButton";
import Editor from "./Common/Editor";
import GroupList from "./lists/GroupList";

export interface ActorPageContentProps {
  actor: Actor.Actor;
  groups: Group.Group[];
  onGroupClick: (a: Group.Group) => void;
}

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  actor,
  groups,
  onGroupClick,
}) => {
  return (
    <Grid container>
      <Grid container direction="row" alignItems="center">
        <Grid item md={3}>
          {pipe(
            O.fromNullable(actor.avatar),
            O.fold(
              () => <div />,
              (src) => <Avatar size="xlarge" src={src} />
            )
          )}
        </Grid>
        <Grid item md={9}>
          <Typography variant="h2">{actor.fullName}</Typography>
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="actors" resource={actor} />
          </div>
          {actor.excerpt ? (
            <Editor value={actor.excerpt as any} readOnly />
          ) : null}
          {actor.body ? <Editor value={actor.body as any} readOnly /> : null}
        </Grid>
      </Grid>
      <Grid container>
        <Grid item md={12}>
          <Box>
            <Typography variant="h4">Gruppi</Typography>
            <GroupList
              groups={groups.map((g) => ({ ...g, selected: false }))}
              onItemClick={onGroupClick}
            />
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};
