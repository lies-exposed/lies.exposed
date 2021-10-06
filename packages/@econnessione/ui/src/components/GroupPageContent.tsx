import { Actor, Events, Group, Project } from "@econnessione/shared/io/http";
import { GroupMember } from "@econnessione/shared/io/http/GroupMember";
import { Grid, Typography } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
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
  ...frontmatter
}) => {
  // const projectFundsInitMap: Map<string, number> = Map.empty;
  // const projectFundsMap = pipe(
  //   funds,
  //   A.reduce(projectFundsInitMap, (acc, f) => {
  //     return pipe(
  //       acc,
  //       Map.lookup(Eq.eqString)(f.project),
  //       O.map((amount) => amount + f.transaction.amount),
  //       O.getOrElse(() => f.transaction.amount),
  //       (value) => Map.insertAt(Eq.eqString)(f.project, value)(acc)
  //     );
  //   })
  // );

  return (
    <Grid container>
      <Grid container direction="column">
        <Grid container direction="row" alignItems="flex-end">
          <Grid item>
            {pipe(
              O.fromNullable(frontmatter.avatar),
              O.fold(
                () => <div />,
                (src) => (
                  <img src={src} style={{ width: "100px", marginRight: 20 }} />
                )
              )
            )}
          </Grid>
          <Grid item>
            <Typography variant="h2">{frontmatter.name}</Typography>
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
          <div>
            {/* <h4>Progetti</h4> */}
            {/* {pipe(
              projectFundsMap,
              Map.toArray(Ord.ordString),
              A.map(([name, value]) => (
                <LabelMedium key={`group-page-content-${name}`}>
                  {name} {value} euro
                </LabelMedium>
              ))
            )} */}
          </div>
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
