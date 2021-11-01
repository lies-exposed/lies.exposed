import { Actor, Group } from "@econnessione/shared/io/http";
import { Box, Grid, Typography } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Avatar } from "./Common/Avatar";
import EditButton from "./Common/Button/EditButton";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";
import GroupList from "./lists/GroupList";

export interface ActorPageContentProps {
  actor: Actor.Actor;
  groups: Group.Group[];
  onGroupClick: (a: Group.Group) => void;
}

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  actor: { body, ...frontmatter },
  groups,
  onGroupClick,
}) => {
  return (
    <Grid container>
      <Grid container direction="row" alignItems="center">
        <Grid item md={3}>
          {pipe(
            O.fromNullable(frontmatter.avatar),
            O.fold(
              () => <div />,
              (src) => <Avatar size="xlarge" src={src} />
            )
          )}
        </Grid>
        <Grid item md={9}>
          <Typography variant="h2">{frontmatter.fullName}</Typography>
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="actors" resource={frontmatter} />
          </div>
          <MarkdownRenderer>{body}</MarkdownRenderer>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item md={12}>
          <Box>
            <Typography variant="h4">Gruppi</Typography>
            <GroupList
              groups={groups.map((g) => ({ ...g, selected: false }))}
              onGroupClick={onGroupClick}
            />
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};
