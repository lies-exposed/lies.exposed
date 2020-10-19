import { PieChartGraph } from "@components/Common/Graph/PieChartGraph"
import { FundFrontmatter } from "@models/Fund"
import ParentSize from "@vx/responsive/lib/components/ParentSize"
import * as Array from "fp-ts/lib/Array"
import { eqString } from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import { ordString } from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"
import React from "react"

interface ProjectFundsPieGraphProps {
  funds: FundFrontmatter[]
}

export const ProjectFundsPieGraph: React.FC<ProjectFundsPieGraphProps> = (
  props
) => {
  const initData: Map<string, FundFrontmatter> = Map.empty
  const data = pipe(
    props.funds,
    Array.reduce(initData, (acc, f) => {
      const key = getUUIDForBy(f)
      return pipe(
        acc,
        Map.lookup(eqString)(key),
        O.map((v) => ({ ...f, amount: f.amount + v.amount })),
        O.getOrElse(() => f),
        (v) => Map.insertAt(eqString)(key, v)(acc)
      )
    }),
    Map.toArray(ordString),
    Array.map(([_, fund]) => fund)
  )

  return (
    <ParentSize style={{ width: "100%", height: 400 }}>
      {({ width, height }) => (
        <PieChartGraph<FundFrontmatter>
          width={width}
          height={height}
          slices={data}
          getLabel={(f) => getLabelForBy(f)}
          getKey={(f) => f.uuid}
          getValue={(f) => f.amount}
        />
      )}
    </ParentSize>
  )
}

const getUUIDForBy = (fund: FundFrontmatter): string => {
  switch (fund.by.__type) {
    case "Actor":
      return fund.by.actor.uuid
    case "Group":
      return fund.by.group.uuid
  }
}

const getLabelForBy = (fund: FundFrontmatter): string => {
  switch (fund.by.__type) {
    case "Actor":
      return fund.by.actor.fullName
    case "Group":
      return fund.by.group.name
  }
}