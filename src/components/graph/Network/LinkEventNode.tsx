import { EventPoint } from "@models/event"
import { Link } from "@vx/network/lib/types"
import { LinkVertical } from "@vx/shape"
import * as React from "react"

export interface LinkEventProps extends Link<EventPoint> {
  stroke: string
}

const LinkEvent: React.FC<LinkEventProps> =({ source, target, stroke }) => {
  return (
    <LinkVertical
      key={`link-${source.data.frontmatter.uuid}-${target.data.frontmatter.uuid}`}
      data={{ source, target }}
      stroke={stroke}
      strokeWidth="2"
      fill="transparent"
    />
  )
}
export default LinkEvent
