import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";
import { Actor, Events, Group, Project } from "@io/http";
import { Grid } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
// import { EventsNetwork } from "./Graph/EventsNetwork"
import EditButton from "./buttons/EditButton";
import GroupList from "./lists/GroupList";

export interface GroupPageContentProps extends Group.Group {
  events: Events.EventMD[];
  projects: Project.Project[];
  funds: Events.ProjectTransaction[];
  onMemberClick: (m: Actor.ActorFrontmatter) => void;
}

export const GroupPageContent: React.FC<GroupPageContentProps> = ({
  onMemberClick,
  projects,
  funds,
  events,
  body,
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
      <Grid item>
        <div>
          <EditButton resourceName="groups" resource={frontmatter} />
        </div>
      </Grid>
      <Grid container>
        <Grid item>
          <div>
            <h2>{frontmatter.name}</h2>
            {pipe(
              O.fromNullable(frontmatter.avatar),
              O.fold(
                () => <div />,
                (src) => <img src={src} style={{ width: "100px" }} />
              )
            )}
            <MarkdownRenderer>{body}</MarkdownRenderer>
          </div>
        </Grid>
        <Grid>
          <div>
            <h4>Sotto Gruppi</h4>
            {
              // eslint-disable-next-line react/jsx-key
              <GroupList groups={[]} onGroupClick={() => {}} />
            }
          </div>
          {/* <Block>
            {pipe(
              frontmatter.members,
              O.fold(
                () => null,
                (actors) => (
                  <Block>
                    <HeadingXSmall>Members</HeadingXSmall>
                    <ActorList
                      actors={actors.map((a) => ({ ...a, selected: true }))}
                      onActorClick={onMemberClick}
                      avatarScale="scale1000"
                    />
                  </Block>
                )
              )
            )}
          </Block> */}
          <div>
            <h4>Progetti</h4>
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
