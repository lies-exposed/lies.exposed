import { hierarchy } from "d3-hierarchy"
import * as Map from "fp-ts/lib/Map"
import * as Ord from "fp-ts/lib/Ord"
import * as React from "react"
import { Pack, PackDatum } from "./Pack"

interface BubbleGraphProps {
  width: number
  height: number
  data: Map<string, PackDatum>
}

export const BubbleGraph: React.FC<BubbleGraphProps> = ({
  width,
  height,
  data,
}) => {
  const children = Map.toArray(Ord.ordString)(data).map(([label, datum]) => ({
    label,
    ...datum,
  }))

  const pack = hierarchy({ children: [{ children }] }).sum(n => n.count)

  return <Pack width={width} height={height} pack={pack} />
}
