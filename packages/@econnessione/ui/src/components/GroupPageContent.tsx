import { Actor, Events, Group, Project } from "@econnessione/shared/io/http";
import { GroupMember } from "@econnessione/shared/io/http/GroupMember";
import { Grid, Typography, useTheme } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import Editor from "./Common/Editor/index";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";
import { ActorList } from "./lists/ActorList";
import GroupList from "./lists/GroupList";

export interface GroupPageContentProps extends Group.Group {
  groupsMembers: GroupMember[];
  events: Events.Event[];
  projects: Project.Project[];
  funds: Events.ProjectTransaction[];
  onMemberClick: (m: Actor.Actor) => void;
}

export const GroupPageContent: React.FC<GroupPageContentProps> = ({
  onMemberClick,
  projects,
  funds,
  events,
  body,
  groupsMembers,
  ...group
}) => {
  const theme = useTheme();

  return (
    <Grid container>
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
          <Grid item md={6}>
            <Typography variant="h6">Sotto Gruppi</Typography>
            <GroupList groups={[]} onGroupClick={() => {}} />
          </Grid>

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
        </Grid>

        <Grid>
          <MarkdownRenderer>{body}</MarkdownRenderer>
        </Grid>
      </Grid>
      {/* <Grid width="100%">
        <EventsNetwork
          events={events.filter(UncategorizedMD.is)}
          selectedGroupIds={[frontmatter.id]}
          selectedActorIds={[]}
          selectedTopicIds={[]}
          scale={"all"}
          scalePoint={O.none}
        />
      </Grid> */}
    </Grid>
  );
};
