import { Group } from "@vx/group"
import { HierarchyPointNode } from "d3-hierarchy"
import * as O from "fp-ts/lib/Option"
import * as React from "react"
import { EventPoint } from "../../../types/event"

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
    ...(onMouseOut !== undefined ? { onMouseOut } : {}),
  }

  return (
    <Group {...groupProps} onClick={() => onClick(node)}>
      {O.fold(
        () => <circle r={12} fill={node.data.fill} />,
        type => (
          <>
            <circle
              r={12}
              fill={type === "AntiEcologicAct" ? "red" : "green"}
            />
            <circle r={8} fill={node.data.fill} />
          </>
        )
      )(node.data.frontmatter.type)}
    </Group>
  )
}
export default NetworkNode
