import {
  Common,
  Events,
  Group,
  Project,
} from "@econnessione/shared/lib/io/http";
import { formatDate } from "@utils/date";
import { RenderHTML } from "@utils/renderHTML";
import { Block } from "baseui/block";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { HeadingXLarge, HeadingXSmall, LabelXSmall } from "baseui/typography";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
// import { ProjectFundsPieGraph } from "./Graph/ProjectFundsPieGraph";
import { Slider } from "./Common/Slider/Slider";
import { ProjectFundsMap } from "./Graph/ProjectFundsMap";
import EditButton from "./buttons/EditButton";
import GroupOrActorList from "./lists/GroupAndActorList";

export interface ProjectPageContentProps extends Project.Project {
  metadata: Events.EventListMap;
}

export const ProjectPageContent: React.FC<ProjectPageContentProps> = ({
  body,
  metadata,
  ...frontmatter
}) => {
  const totalFunded = 0;
  const investors: Common.ByGroupOrActor[] = [];
  // const totalFunded = pipe(
  //   metadata.ProjectTransaction,
  //   A.reduce(0, (acc, f) => f.transaction.amount + acc)
  // );

  // const investors = pipe(
  //   metadata.ProjectTransaction,
  //   A.map((f) => f.transaction.by),
  //   A.uniq(
  //     Eq.eq.contramap(Eq.eqString, (e: Common.ByGroupOrActor) =>
  //       e.type === "Group" ? e.group.id : e.actor.id
  //     )
  //   )
  // );

  // const arrested = pipe(
  //   metadata.Arrest,
  //   A.map((a) => a.who)
  // );

  // const protesters = pipe(
  //   metadata.Protest,
  //   A.map((p) => p.organizers),
  //   A.flatten
  // );

  return (
    <FlexGrid width="100%">
      <FlexGridItem width="100%">
        <Block
          overrides={{ Block: { style: { textAlign: "right", margin: 10 } } }}
        >
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="areas" resource={frontmatter} />
          </div>
        </Block>
        <Block>
          <HeadingXLarge>{frontmatter.name}</HeadingXLarge>
          <div>
            <LabelXSmall>
              Data di inizio {formatDate(frontmatter.startDate)}
            </LabelXSmall>
            {pipe(
              O.fromNullable(frontmatter.endDate),
              O.map((date) => (
                // eslint-disable-next-line react/jsx-key
                <LabelXSmall>Data di fine {formatDate(date)}</LabelXSmall>
              )),
              O.toNullable
            )}
          </div>
        </Block>
      </FlexGridItem>
      <FlexGridItem
        flexGridColumnCount={2}
        flexGridColumnGap="scale800"
        gridColumnGap="scale800"
        display="flex"
      >
        <FlexGridItem
          overrides={{
            Block: {
              style: ({ $theme }) => ({
                width: `calc((200% - ${$theme.sizing.scale800}))`,
              }),
            },
          }}
        >
          {pipe(
            O.fromNullable(frontmatter.images),
            O.map((images) => (
              <Block key={`project-${frontmatter.id}`} width="100%">
                <Slider
                  key={`project-${frontmatter.id}-slider`}
                  height={400}
                  slides={images.map((i) => ({
                    authorName: "",
                    info: O.getOrElse(() => "")(i.description),
                    imageURL: i.image,
                  }))}
                  arrows={true}
                  adaptiveHeight={true}
                  dots={true}
                  size="contain"
                />
              </Block>
            )),
            O.toNullable
          )}
          <ProjectFundsMap project={{ ...frontmatter, body }} />
        </FlexGridItem>
        <FlexGridItem
          overrides={{
            Block: { style: { flexGrow: 0 } },
          }}
        >
          <Block>
            <HeadingXSmall padding={0}>Fondi: {totalFunded}</HeadingXSmall>
            {/* <GroupOrActorList
              by={investors}
              onByClick={() => {}}
              avatarScale="scale1000"
            /> */}
            {/* <ProjectFundsPieGraph funds={metadata.ProjectTransaction} /> */}
          </Block>
          <Block>
            <HeadingXSmall>Proteste {metadata.Protest.length}</HeadingXSmall>
            {/* <GroupOrActorList
              by={protesters}
              onByClick={() => {}}
              avatarScale="scale1000"
            /> */}
          </Block>
          <Block>
            <HeadingXSmall>Arresti: {metadata.Arrest.length}</HeadingXSmall>
            {/* <GroupOrActorList
              by={arrested}
              onByClick={() => {}}
              avatarScale="scale1000"
            /> */}
          </Block>
          <Block>
            <HeadingXSmall>
              Impacts: {metadata.ProjectImpact.length}
            </HeadingXSmall>
            [tabella degli impatti del progetto]
          </Block>
          <Block>
            <HeadingXSmall display="inline">Indagati:</HeadingXSmall> [totale
            contributori / contributori indagati]
          </Block>
        </FlexGridItem>
      </FlexGridItem>
      <FlexGridItem>
        {/* <div className="content">{RenderHTML({ children: body })}</div> */}
      </FlexGridItem>
    </FlexGrid>
  );
};
