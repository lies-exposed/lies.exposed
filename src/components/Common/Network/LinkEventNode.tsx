import { Link } from "@vx/network/lib/types"
import { LinkVertical } from "@vx/shape"
import * as React from "react"
import { EventPoint } from "../../../types/event"

export interface LinkEventProps extends Link<EventPoint> {
  stroke: string
}

const LinkEvent: React.FC<LinkEventProps> =({ source, target, stroke }) => {
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
