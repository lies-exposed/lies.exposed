import { FundFrontmatter } from "@models/Fund"
import { ActorMD } from "@models/actor"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingXLarge, HeadingXSmall, LabelMedium } from "baseui/typography"
import * as A from "fp-ts/lib/Array"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import Image from "gatsby-image"
import * as React from "react"
import EditButton from "./buttons/EditButton"

export interface ActorPageContentProps extends ActorMD {
  funds: FundFrontmatter[]
}

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  frontmatter,
  funds,
  body,
}) => {
  const projectFundsInitMap: Map<string, number> = Map.empty
  const projectFundsMap = pipe(
    funds,
    A.reduce(projectFundsInitMap, (acc, f) => {
      return pipe(
        acc,
        Map.lookup(Eq.eqString)(f.project.name),
        O.map((amount) => amount + f.amount),
        O.getOrElse(() => f.amount),
        (value) => Map.insertAt(Eq.eqString)(f.project.name, value)(acc)
      )
    })
  )

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
          <HeadingXSmall>Progetti</HeadingXSmall>
          {pipe(
            projectFundsMap,
            Map.toArray(Ord.ordString),
            A.map(([name, value]) => (
              <LabelMedium key={name}>
                {name} {value} euro
              </LabelMedium>
            ))
          )}
        </Block>
        <div className="content">{renderHTML({ body })}</div>
      </FlexGridItem>
    </FlexGrid>
  )
}
