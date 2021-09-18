import { Actor, Group } from "@econnessione/shared/io/http";
import { Box, Grid, Typography } from "@material-ui/core";
import { navigate } from "@reach/router";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Avatar } from "./Common/Avatar";
import EditButton from "./buttons/EditButton";
import GroupList from "./lists/GroupList";
import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";

export interface ActorPageContentProps {
  actor: Actor.Actor;
  groups: Group.Group[];
}

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  actor: { body, ...frontmatter },
  groups,
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
              onGroupClick={async (g) => {
                await navigate(`/groups/${g.id}`);
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};
