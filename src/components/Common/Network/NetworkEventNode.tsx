import * as React from "react"
import { Group } from "@vx/group"
import { HierarchyPointNode } from "d3-hierarchy"
import { EventPoint } from "../../../types/event"

export interface NetworkNodeProps {
  node: HierarchyPointNode<EventPoint["data"]>
  fill: string
  onMouseOver?: (
    event: React.MouseEvent<SVGElement, React.MouseEvent>,
    data: EventPoint["data"]
  ) => void
  onMouseOut?: (event: React.MouseEvent<SVGElement, React.MouseEvent>) => void
  onClick: (event: EventPoint) => void
}

function NetworkNode({
  node,
  fill,
  onMouseOver,
  onMouseOut,
  onClick
}: NetworkNodeProps) {
  const groupProps = {
    ...(onMouseOver
      ? {
          onMouseOver: (
            event: React.MouseEvent<SVGElement, React.MouseEvent>
          ) => onMouseOver(event, node.data),
        }
      : {}),
    ...(onMouseOut ? { onMouseOut } : {}),
  }
  return (
    <Group {...groupProps}>
      <circle r={12} fill={fill} onClick={() => onClick(node)} />
    </Group>
  )
}
export default NetworkNode
