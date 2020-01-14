import * as React from "react"
import { LinkVertical } from "@vx/shape"
import { EventPoint } from "../../../types/event"
import { Link } from "@vx/network/lib/types"

export interface LinkEventProps extends Link<EventPoint> {
  stroke: string
}

function LinkEvent({ source, target, stroke }: LinkEventProps) {
  return (
    <LinkVertical
      key={`link-${source.data.id}-${target.data.id}`}
      data={{ source, target }}
      stroke={stroke}
      strokeWidth="2"
      fill="transparent"
    />
  )
}
export default LinkEvent
