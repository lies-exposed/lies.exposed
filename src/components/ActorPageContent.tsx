import { ActorMD } from "@models/actor"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingXLarge } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import Image from "gatsby-image"
import * as React from "react"
import EditButton from "./buttons/EditButton"

export type ActorPageContentProps = ActorMD

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  frontmatter,
  body,
}) => {
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
            <Image fluid={i.childImageSharp.fluid} style={{ width: "100px" }} />
          )
        )
      )}
      <div className="content">{renderHTML({ body })}</div>
      </FlexGridItem>
    </FlexGrid>
  )
}
