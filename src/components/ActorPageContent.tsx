import ProjectFundList from "@components/lists/ProjectFundList"
import { ActorMD } from "@models/actor"
import { EventMetadataMap } from "@models/EventMetadata"
import { formatDate } from "@utils/date"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingXLarge, HeadingXSmall, LabelMedium } from "baseui/typography"
import * as A from "fp-ts/lib/Array"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import Image from "gatsby-image"
import * as React from "react"
import EditButton from "./buttons/EditButton"
import { ProjectFundsPieGraph } from "./Graph/ProjectFundsPieGraph"

export interface ActorPageContentProps extends ActorMD {
  metadata: EventMetadataMap
}

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  frontmatter,
  metadata,
  body,
}) => {
  const projectFunds = metadata.ProjectFund
  const arrests = metadata.Arrest
  const protests = metadata.Protest

  return (
    <FlexGrid width="100%">
      <FlexGridItem width="100%">
        <Block overrides={{ Block: { style: { textAlign: "right" } } }}>
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="actors" resource={frontmatter} />
          </div>
        </Block>
        <HeadingXLarge>{frontmatter.fullName}</HeadingXLarge>
        {pipe(
          frontmatter.avatar,
          O.fold(
            () => <div />,
            (i) => (
              <Image
                fluid={i.childImageSharp.fluid}
                style={{ width: "100px" }}
              />
            )
          )
        )}
        <Block>
          <HeadingXSmall>Fondi ({projectFunds.length})</HeadingXSmall>
          <ProjectFundList
            funds={projectFunds.map((f) => ({ ...f, selected: true }))}
            onClickItem={() => {}}
          />
          <ProjectFundsPieGraph funds={projectFunds} />
        </Block>
        <Block>
          <HeadingXSmall>Proteste ({protests.length})</HeadingXSmall>
          {pipe(
            protests,
            A.map((value) => (
              <div key={value.date.toISOString()}>
                <LabelMedium display="inline">
                  {formatDate(value.date)}
                </LabelMedium>{" "}
                <span>
                  <span key={value.for.uuid}>{value.for.uuid}</span>
                </span>
              </div>
            ))
          )}
        </Block>
        <Block>
          <HeadingXSmall>Arresti ({arrests.length})</HeadingXSmall>
          {pipe(
            arrests,
            A.map((value) => (
              <>
                <LabelMedium key={value.date.toISOString()} display="inline">
                  {formatDate(value.date)}
                </LabelMedium>
                <span>
                  {value.for.map((f) => (
                    <span key={f.uuid}>{f.uuid}</span>
                  ))}
                </span>
              </>
            ))
          )}
        </Block>
        <div className="content">{renderHTML({ body })}</div>
      </FlexGridItem>
    </FlexGrid>
  )
}
