import {
  Actor,
  Events,
  Group,
  Project,
} from "@econnessione/shared/lib/io/http";
import { RenderHTML } from "@utils/renderHTML";
import { Block } from "baseui/block";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { HeadingXLarge, HeadingXSmall, LabelMedium } from "baseui/typography";
import * as A from "fp-ts/lib/Array";
import * as Eq from "fp-ts/lib/Eq";
import * as Map from "fp-ts/lib/Map";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
// import { EventsNetwork } from "./Graph/EventsNetwork"
import EditButton from "./buttons/EditButton";
import ActorList from "./lists/ActorList";
import GroupList from "./lists/GroupList";

export interface GroupPageContentProps extends Group.Group {
  events: Events.EventMD[];
  projects: Project.Project[];
  funds: Events.ProjectTransaction.ProjectTransaction[];
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
  const projectFundsInitMap: Map<string, number> = Map.empty;
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
    <FlexGrid
      width="100%"
      flexGridColumnCount={1}
      flexGridColumnGap="scale800"
      flexGridRowGap="scale800"
      marginBottom="scale800"
      flexDirection="row"
      display="flex"
    >
      <FlexGridItem width="100%">
        <Block overrides={{ Block: { style: { textAlign: "right" } } }}>
          <EditButton resourceName="groups" resource={frontmatter} />
        </Block>
      </FlexGridItem>
      <FlexGridItem width="100%" display="flex" flexGridColumnCount={2}>
        <FlexGridItem
          width="100%"
          display="flex"
          overrides={{
            Block: {
              style: ({ $theme }) => ({
                width: `calc((200% - ${$theme.sizing.scale800}))`,
              }),
            },
          }}
        >
          <Block overrides={{ Block: { style: { width: "100%" } } }}>
            <HeadingXLarge>{frontmatter.name}</HeadingXLarge>
            {pipe(
              O.fromNullable(frontmatter.avatar),
              O.fold(
                () => <div />,
                (src) => <img src={src} style={{ width: "100px" }} />
              )
            )}
            <div className="content">{RenderHTML({ children: body })}</div>
          </Block>
        </FlexGridItem>
        <FlexGridItem>
          <Block>
            <HeadingXSmall>Sotto Gruppi</HeadingXSmall>
            {
              // eslint-disable-next-line react/jsx-key
              <GroupList
                avatarScale="scale1000"
                groups={frontmatter.subGroups.map((g) => ({
                  ...g,
                  selected: true,
                }))}
                onGroupClick={() => {}}
              />
            }
          </Block>
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
          <Block>
            <HeadingXSmall>Progetti</HeadingXSmall>
            {/* {pipe(
              projectFundsMap,
              Map.toArray(Ord.ordString),
              A.map(([name, value]) => (
                <LabelMedium key={`group-page-content-${name}`}>
                  {name} {value} euro
                </LabelMedium>
              ))
            )} */}
          </Block>
        </FlexGridItem>
      </FlexGridItem>
      {/* <FlexGridItem width="100%">
        <EventsNetwork
          events={events.filter(UncategorizedMD.is)}
          selectedGroupIds={[frontmatter.id]}
          selectedActorIds={[]}
          selectedTopicIds={[]}
          scale={"all"}
          scalePoint={O.none}
        />
      </FlexGridItem> */}
    </FlexGrid>
  );
};
