import { ProjectMD } from "@models/Project"
import { EventListMap } from "@models/events/EventMetadata"
import { formatDate } from "@utils/date"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingSmall, HeadingXLarge, LabelXSmall } from "baseui/typography"
import * as A from "fp-ts/lib/Array"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"
import { ProjectFundsMap } from "./Graph/ProjectFundsMap"
import { ProjectFundsPieGraph } from "./Graph/ProjectFundsPieGraph"
import { Slider } from "./Slider/Slider"
import EditButton from "./buttons/EditButton"
import GroupOrActorList from "./lists/GroupAndActorList"

export interface ProjectPageContentProps extends ProjectMD {
  metadata: EventListMap
}

export const ProjectPageContent: React.FC<ProjectPageContentProps> = ({
  frontmatter,
  body,
  metadata,
}) => {

  const totalFunded = pipe(
    metadata.ProjectFund,
    A.reduce(0, (acc, f) => f.amount + acc)
  )

  const investors = pipe(
    metadata.ProjectFund,
    A.map((f) => f.by),
  )

  const arrested = pipe(
    metadata.Arrest,
    A.map((a) => a.who)
  )

  const protesters = pipe(
    metadata.Protest,
    A.map((p) => p.by),
    A.flatten
  )

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
              frontmatter.endDate,
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
            frontmatter.images,
            O.map((images) => (
              <Block key={`project-${frontmatter.uuid}`} width="100%">
                <Slider
                  key={`project-${frontmatter.uuid}-slider`}
                  height={400}
                  slides={images.map((i) => ({
                    authorName: "",
                    info: O.getOrElse(() => "")(i.description),
                    imageURL: i.image.publicURL,
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
          <ProjectFundsMap project={frontmatter} />
        </FlexGridItem>
        <FlexGridItem
          overrides={{
            Block: { style: { flexGrow: 0 } },
          }}
        >
          <Block>
            <HeadingSmall>Fondi: {totalFunded}</HeadingSmall>
            <GroupOrActorList
              by={investors}
              onByClick={() => {}}
              avatarScale="scale1000"
            />
            <ProjectFundsPieGraph funds={metadata.ProjectFund} />
          </Block>
          <Block>
            <HeadingSmall>Proteste {metadata.Protest.length}</HeadingSmall>
            <GroupOrActorList
              by={protesters}
              onByClick={() => {}}
              avatarScale="scale1000"
            />
          </Block>
          <Block>
            <HeadingSmall>Arresti: {metadata.Arrest.length}</HeadingSmall>
            <GroupOrActorList
              by={arrested}
              onByClick={() => {}}
              avatarScale="scale1000"
            />
          </Block>
          
        </FlexGridItem>
      </FlexGridItem>
      <FlexGridItem>
        <div className="content">{renderHTML({ body })}</div>
      </FlexGridItem>
    </FlexGrid>
  )
}
