import { EventPoint } from "@models/event"
import { getColorByEventType } from "@utils/event"
import { Group } from "@vx/group"
import { HierarchyPointNode } from "d3-hierarchy"
import * as React from "react"

export interface NetworkNodeProps {
  node: HierarchyPointNode<EventPoint["data"]>
  onMouseOver?: (
    event: React.MouseEvent<SVGElement, React.MouseEvent>,
    data: EventPoint["data"]
  ) => void
  onMouseOut?: (event: React.MouseEvent<SVGElement, React.MouseEvent>) => void
  onClick: (event: EventPoint) => void
}

const NetworkNode: React.FC<NetworkNodeProps> = ({
  node,
  onMouseOver,
  onMouseOut,
  onClick,
}) => {
  const groupProps = {
    ...(onMouseOver !== undefined
      ? {
          onMouseOver: (
            event: React.MouseEvent<SVGElement, React.MouseEvent>
          ) => onMouseOver(event, node.data),
        }
      : {}),
    ...(onMouseOut !== undefined
      ? {
          onMouseOut,
        }
      : {}),
  }

  const outerCircleColor = node.data.fields.topics[0].color
  const circleColor =  getColorByEventType({
    type: node.data.frontmatter.type,
  })

  return (
    <Group {...(groupProps as any)} onClick={() => onClick(node)}>
      <>
        <circle r={8} fill={outerCircleColor} />
        <circle r={3} fill={circleColor} />
      </>
    </Group>
  )
}
export default NetworkNode
